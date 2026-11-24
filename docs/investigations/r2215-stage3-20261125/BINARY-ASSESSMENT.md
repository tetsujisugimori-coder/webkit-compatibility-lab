# 既存バイナリ解析と公開ソースの対応評価

## 既存の実測値（PR #20/#21引継ぎ）
- r2215 ELF: libWPEWebKit-2.0.so.1.7.0、125,254,136 bytes、SHA-256 daa10258a2161710c7c1d6a3e3f7abe0a100a6f269c00f5843dcd0f7df46ec29、Build ID 8faf9134c0557d2d09f3d680f9c8b780498cf59b。
- PR #20 WebProcess PID 5817 / GDB Thread 1 LWP 5817 / SIGABRT(6)。ブラウザstderr optional:479 / this->_M_is_engaged()。WebKitフレーム #6 = 0x7f41fc5208ae。
- GDB maps のRX開始 0x7f41f87d0000、ファイルオフセット 0x7d0000 から算出したロードベース 0x7f41f8000000。フレーム #6 をELF VMAへ変換すると0x45208ae。
- PR #21報告: 0x45208a9に std::__glibcxx_assert_fail 呼出し、0x45208aeが復帰PC。型 unsigned long を含む optional 内部assertion文字列と一致。配布ELFに.symtab/.debug_info/.gnu_debuglink/.gnu_debugdataなし。
- 追加readelfの報告FDE: 0x4520120 <= PC < 0x45208d2。

## 今回の検証と限界
- 算術検査: 0x4520120 < 0x45208a9 < 0x45208ae < 0x45208d2。**報告されたFDEとassertion呼出し/復帰PCの範囲整合はCONFIRMED（算術のみ）**。
- VMA計算とC++ optional文字列の関連: 既存PRの技術資料および正式CI/artifact存在・SHAからSTRONGLY_SUPPORTED。今回ELF生バイト/objdump実出力は再取得していない。
- FDEはunwind情報の範囲を示すが、ソース上の厳密な関数名やテンプレート展開元を単独では明かさない。特に近傍の公開動的シンボルを帰属根拠にしない。
- std::optional<unsigned long> は索引用size_t等と整合するが、previousNavigation側・現在側のどちらかは判定不能。NavigationNavigationType optionalの別検査とは型を区別すべき。
- #300402はWebKitGTKのシンボル付き別ビルド、こちらはWPE r2215。OS/ライブラリ/Build IDが異なる。類似スタックは仮説の補助であって実配布PCの証明でない。
- PR #20の実行時バイナリのSHA/Build ID原票が無く、PR #21の後日取得ELFとの完全なバイト一致はUNKNOWN。
- 対応する同一Build IDのDWARF未取得、実関数帰属はBLOCKED。新規readelf・逆アセンブル・GDB・実ブラウザ実行は今回はNOT_TESTED。

## 関数帰属の評価
公開ソースにinitializeForNewWindowの optional index参照の危険経路があり、Bug #300402には同関数の署名付きスタックがある。一方今回のWPEスタックでは該当WebKitフレーム名は??。従って「同関数である」という記述はHYPOTHESISまでで、CONFIRMEDもSTRONGLY_SUPPORTEDも不可。関数責務と症状は整合するが、他の呼出し元も排除できない。

## 正確な証拠の入口
- PR #20 https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/20
- PR #21 https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/pull/21
- 既存原票 https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/actions/runs/44992423234/artifacts/14742670307
- 既存原票 https://github.com/tetsujisugimori-coder/webkit-compatibility-lab/actions/runs/44996352539/artifacts/14744180842
