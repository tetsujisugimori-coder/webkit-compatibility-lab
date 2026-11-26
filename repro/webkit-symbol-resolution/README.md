# r2215配布ELFの同一性確認と既存GDBアドレスの関数復元

対象: #18、#19、#20。対象原票は [#14742670307](https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/actions/runs/44992423234/artifacts/14742670307)、WebProcess PID=5817、SIGABRT、WebKitフレーム#6の実行時アドレスは `0x7f41fc5208ae`。

## 実施範囲
- 元の `gdb-backtrace.txt` の `libWPEWebKit-2.0.so.1.7.0` RX領域は開始 `0x7f41f87d0000`、ファイルオフセット `0x7d0000`。実ロード基準 `0x7f41f8000000` よりPCを補正し、フレーム#6のELF VMAは `0x45208ae`。
- Playwright 1.56.1固定配布の **WebKit r2215 Ubuntu 24.04** をブラウザ起動なしでダウンロードする。
- 正確なELFのSHA256、GNU Build ID、`.symtab`/`.debug_info`/`.gnu_debuglink`/`.gnu_debugdata`、dynamic symbolを検査。
- 同一ELFに対する `addr2line`、`nm -D -C`、`objdump` を実行する。**最寄りの公開シンボルは関数範囲が確定していない限り推定にとどめる**。
- Build IDがある場合、公開debuginfod候補2か所をHEADで照会し、明示的200のときだけ容量制限付きで取得・Build ID一致とdebug情報の存在を検証する。
- 違うビルドのシンボルや上流ソース上の関数名でアドレスを断定しない。デバッグファイルは受入用レポートのみ保存し、巨大バイナリは新たな保全対象にしない。
- **一致シンボルが見つからない場合は、関数の特定 UNKNOWN を維持**する。元のSIGABRT証拠を変更しない。

## 受入条件
- アドレス→関数をRESOLVEDとするのは、元配布ELF自体に該当シンボルがあるか、GNU Build ID一致のデバッグ情報で特定できた場合のみ。
- 取得不能の結果も実施済み調査として記録し、別ビルドでの再現は実施しない。
- PR #19/#20はDraft・未マージ、既存Atlas製品HOLD維持。
