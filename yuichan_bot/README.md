# ゆいちゃん
Krunker公式交流専用Bot

# 機能拡張について
## 共通
- ファイル名とコマンド/インタラクション名は一致する必要はない
## コマンド
ファイルパス: `src/commands/`
| プロパティ | 詳細 |
| :--: | :--: |
| name | コマンド名 |
| permission | 必要なロールのID or everyone |
| help | helpコマンドで表示される内容 |
| disable | コマンドの無効化 |
| hidden | helpコマンドで非表示にする |
| args | `must`: 必須オプション名, `optional`: 任意オプション名 |
| execute | 実行関数 |

## インタラクション
ファイルパス: `src/interacts/`
| プロパティ | 詳細 |
| :--: | :--: |
| name | インタラクションのcustomId |
| permission | 必要なロールのID or everyone |
| disable | インタラクションの無効化 |
| execute | 実行関数 |

## プラグイン(起動時に実行)
ファイルパス: `src/plugins/`
| プロパティ | 詳細 |
| :--: | :--: |
| name | プラグイン名 |
| permission | 必要なロールのID or everyone |
| description | コンソールで表示される内容 |
| disable | プラグインの無効化 |
| execute | 実行関数 |