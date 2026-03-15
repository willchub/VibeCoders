# Deploying to GitHub Pages

GitHub Pages was showing only the README because it was serving the **repo root** (your source code), not the **built** React app. Follow these steps to serve the app instead.

## 1. Set your GitHub Pages URL

In **`package.json`**, set `homepage` to your actual GitHub Pages URL:

- If your repo is **https://github.com/yourusername/UNIHACK**  
  use: `"homepage": "https://yourusername.github.io/UNIHACK"`
- If the repo name is different, use: `"homepage": "https://yourusername.github.io/your-repo-name"`

Replace `yourusername` with your GitHub username (and `UNIHACK` with the repo name if it’s different).

## 2. Deploy the app

From the project root, run:

```bash
npm run deploy
```

This will:

1. Build the app (`npm run build`)
2. Push the contents of the `build` folder to a branch named `gh-pages`

## 3. Turn on GitHub Pages

1. Open your repo on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, choose **Deploy from a branch**.
3. Under **Branch**, select **gh-pages** and **/ (root)**.
4. Click **Save**.

After a minute or two, your site will be at:

**https://yourusername.github.io/UNIHACK** (or your repo name).

## 4. Updating the site

Whenever you want to update the live site:

```bash
npm run deploy
```

No need to change any GitHub settings again.

## Troubleshooting

- **Still seeing the README?**  
  Make sure in **Settings → Pages** the source is the **gh-pages** branch and folder **/ (root)**. Do not use “Deploy from main” with the root or `/docs` unless you’ve set up a different build pipeline.

- **Blank page or broken assets?**  
  Check that `homepage` in `package.json` matches your real URL (including repo name), e.g. `https://yourusername.github.io/UNIHACK`, then run `npm run deploy` again.

- **404 on refresh?**  
  A `public/404.html` (copy of `index.html`) is included so GitHub Pages serves the app for unknown paths; refreshes and direct links to routes like `/marketplace` should work.
