# zeta card maker

スマホから入力して、そのまま画像保存できる静的サイトです。

## 構成
- `index.html`
- `styles.css`
- `app.js`
- `assets/template-question.jpg`
- `assets/template-profile.jpg`

## GitHub Pages で公開
1. GitHub で新しいリポジトリを作る
2. このフォルダの中身をそのまま push
3. GitHub の `Settings > Pages` で公開元を `Deploy from a branch` にする
4. Branch を `main`、Folder を `/ (root)` にする
5. 数分待つと公開URLが出る

## 補足
- 入力内容は `localStorage` に保存されます
- 画像保存は `html2canvas` を使っています
- テンプレ位置は CSS の absolute 配置なので、必要なら微調整してください
