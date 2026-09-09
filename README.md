# Resume Homepage - gohost.no

A fast, responsive, and minimalist resume & portfolio website hosted for free on GitHub Pages at **[gohost.no](https://gohost.no)**.

## Features
- **Zero Cost**: Hosted 100% free with GitHub Pages and custom domain SSL.
- **Responsive & Modern**: Clean typography, card layout, and mobile-friendly design.
- **Dark / Light Mode**: Auto-detects system theme with a manual toggle stored in `localStorage`.
- **Print / PDF Friendly**: Custom `@media print` CSS cleanly strips web buttons and formats your resume for paper or PDF export.
- **Lightning Fast**: Pure HTML5, CSS3, and vanilla JS with zero external framework dependencies.

## Local Preview
To preview your resume locally, run:
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

## Deploying to GitHub Pages
1. Create a repository on GitHub named:
   `gohovd.github.io`
   *(or any repository name like `homepage`)*

2. Push this directory to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial resume homepage"
   git branch -M main
   git remote add origin git@github.com:gohovd/gohovd.github.io.git
   git push -u origin main
   ```

3. In GitHub:
   - Go to **Settings** > **Pages**.
   - Ensure the Source is set to **Deploy from a branch** (`main` / `/root`).
   - The Custom domain will automatically detect `gohost.no` from the `CNAME` file.
   - Once DNS is set up and verified, check **Enforce HTTPS**.

## DNS Configuration for gohost.no
In your domain registrar's DNS manager (Syse / Datacenter.no):

1. **A Records** for `@` (apex domain `gohost.no`):
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`

2. **CNAME Record** for `www`:
   - Host: `www`
   - Target: `gohovd.github.io.`
