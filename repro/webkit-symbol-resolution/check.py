#!/usr/bin/env python3
"""Analyze the exact Playwright WebKit 2215 ELF, with strict Build ID checks.
No browser starts, no modification to prior evidence or diagnostic logic.
"""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import urllib.request
import urllib.error

LIB = Path(os.environ["WEBKIT_ELF"]).resolve(strict=True)
OUT = Path(os.environ.get("SYMBOL_REPORT_DIR", "evidence/r2215-symbols"))
OUT.mkdir(parents=True, exist_ok=True)
BASE = 0x7f41f87d0000 - 0x7d0000   # GDB native artifact #14742670307: r-xp start minus file offset
FRAMES = {
    6: 0x7f41fc5208ae, 7: 0x7f41fc3b356f, 8: 0x7f41fc391f63,
    9: 0x7f41fc389269, 10: 0x7f41f9227fc8, 11: 0x7f41fc391129,
    12: 0x7f41fc4310ef, 13: 0x7f41fc430d26, 14: 0x7f41fc415d1e,
    15: 0x7f41f9194bfb, 16: 0x7f41f8960e54, 17: 0x7f41f9188820,
    18: 0x7f41f895f4aa, 19: 0x7f41f8dc09ab, 20: 0x7f41f8dc0b55,
    21: 0x7f41f8dc0c91, 22: 0x7f41fa9119f5, 23: 0x7f41fa9c4876,
    24: 0x7f41fa9c3bfa, 28: 0x7f41fa9c4123, 29: 0x7f41f92b2ac0,
}
def run(args, timeout=30):
    try:
        p = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
        return {"code":p.returncode,"stdout":p.stdout,"stderr":p.stderr}
    except Exception as e:
        return {"code":None,"stdout":"","stderr":repr(e)}
def buildid(blob):
    m = re.search(r"Build ID:\s*([0-9a-fA-F]+)", blob)
    return m.group(1).lower() if m else None
def digest(path):
    sha=hashlib.sha256()
    with open(path,"rb") as fh:
        for block in iter(lambda:fh.read(1024*1024),b""):
            sha.update(block)
    return sha.hexdigest()
def sections(path):
    rr=run(["readelf","-SW",str(path)],timeout=40)
    names=re.findall(r"\[\s*\d+\]\s+(\S+)",rr["stdout"])
    return names
notes=run(["readelf","-n",str(LIB)])
bld=buildid(notes["stdout"])
sect=sections(LIB)
nm=run(["nm","-D","-n","-C",str(LIB)],timeout=60)
sym=[]
for line in nm["stdout"].splitlines():
    m=re.match(r"^([0-9a-fA-F]+)\s+([A-Za-z])\s+(.*)$",line)
    if m and m.group(2).upper() in ("T","W"):
        sym.append((int(m.group(1),16),m.group(3)))
sym.sort()
report={
 "source_artifact":"https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/actions/runs/44992423234/artifacts/14742670307",
 "reference_stack":"WPEWebProcess PID=5817 SIGABRT; GDB mapping r-xp start 0x7f41f87d0000 offset 0x7d0000",
 "elf_path":str(LIB),"elf_sha256":digest(LIB),"elf_size":LIB.stat().st_size,
 "build_id":bld,"sections":sect,"has_symtab":".symtab" in sect,
 "has_debug_info":".debug_info" in sect,"has_gnu_debuglink":".gnu_debuglink" in sect,
 "has_gnu_debugdata":".gnu_debugdata" in sect,
 "dynamic_symbol_count":len(sym),"frames":[],
 "external_symbol_requests":[],
 "external_symbol_matched":False,
 "final_attribution":"UNKNOWN",
}
for frame,pc in FRAMES.items():
    vma=pc-BASE
    nearest=next(((off,name) for off,name in reversed(sym) if off<=vma),None)
    distance=(vma-nearest[0]) if nearest else None
    # nearest lower exported function is a HINT ONLY: it may not cover the PC.
    line=run(["addr2line","-C","-f","-e",str(LIB),hex(vma)],timeout=10)["stdout"].splitlines()
    report["frames"].append({
      "frame":frame,"runtime_pc":hex(pc),"elf_vma":hex(vma),
      "addr2line":line[:2],
      "nearest_lower_dynamic_export":nearest[1] if nearest else None,
      "distance_from_export":distance,
      "function_confirmed":bool(line and line[0]!="??"),
    })
(OUT/"elf-notes.txt").write_text(notes["stdout"],encoding="utf-8")
(OUT/"elf-sections.txt").write_text(run(["readelf","-SW",str(LIB)])["stdout"],encoding="utf-8")
(OUT/"nearby-disassembly.txt").write_text(
    run(["objdump","-d","-C","--start-address=0x4520800","--stop-address=0x4520950",str(LIB)],timeout=50)["stdout"],encoding="utf-8")
(OUT/"target-dynamic-symbols.txt").write_text(
    "\n".join(f"{addr:x} {name}" for addr,name in sym if "Navigation::" in name or "FrameLoader::" in name)+"\n",encoding="utf-8")
if bld:
    # Check only known public debuginfod endpoints; do not presume a negative response
    # proves that a matching private symbol file does not exist.
    for host in ("https://debuginfod.elfutils.org","https://debuginfod.ubuntu.com"):
        url=host+"/buildid/"+bld+"/debuginfo"
        head=run(["curl","-L","-sS","-I","--max-time","15","-o","/dev/null",
          "-w","%{http_code} %{url_effective} %{size_download}",url],timeout=20)
        status=(head["stdout"].split() or ["unknown"])[0]
        record={"server":host,"http_status":status,"head_exit":head["code"],
                "head_error":head["stderr"][:300]}
        report["external_symbol_requests"].append(record)
        if status=="200":
            dest=OUT/"matching-debug-candidate"
            fetch=run(["curl","-fsSL","--max-time","90","--max-filesize","250000000",
                       "-o",str(dest),url],timeout=100)
            record["download_exit"]=fetch["code"]
            record["download_error"]=fetch["stderr"][:200]
            if fetch["code"]==0 and dest.is_file():
                record["candidate_size"]=dest.stat().st_size
                other_id=buildid(run(["readelf","-n",str(dest)])["stdout"])
                record["candidate_build_id"]=other_id
                if other_id==bld and ".debug_info" in sections(dest):
                    report["external_symbol_matched"]=True
                    report["matched_debug_sha256"]=digest(dest)
                    for frame in report["frames"]:
                        line=run(["addr2line","-C","-f","-e",str(dest),
                                  frame["elf_vma"]])["stdout"].splitlines()
                        frame["external_addr2line"]=line[:2]
                        frame["function_confirmed"]=bool(line and line[0]!="??")
                    report["final_attribution"]="RESOLVED_WITH_MATCHING_BUILD_ID"
                else:
                    record["rejected_reason"]="Build-ID mismatch or missing .debug_info"
                dest.unlink(missing_ok=True)  # Avoid preserving huge unrelated/debug files.
if not report["external_symbol_matched"]:
    report["final_attribution"]="BINARY_UNSYMBOLIZED"
(OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({k:report[k] for k in ("build_id","elf_sha256","elf_size","has_symtab",
    "has_debug_info","has_gnu_debuglink","has_gnu_debugdata",
    "dynamic_symbol_count","external_symbol_requests","external_symbol_matched","final_attribution")},ensure_ascii=False))
for row in report["frames"]:
    print(f"#{row['frame']} {row['elf_vma']} addr2line={row['addr2line']} nearest_export={row['nearest_lower_dynamic_export']} distance={row['distance_from_export']}")
