# STRATA — Archaeology of Time

A cinematic 3D archaeology experience built with Three.js. Scrolling moves the camera through an excavation site, subterranean strata, a sealed chamber, an artifact scan, a research lab, and a living archive.

## Publish on GitHub Pages

1. Create a **public** GitHub repository named `strata-archaeology`.
2. Upload all files from this folder to the **root** of the repository. `index.html` must be visible at the top level—not inside another folder.
3. Commit the files to the `main` branch.
4. Open **Settings → Pages** in the repository.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Select branch **main** and folder **/(root)**, then click **Save**.
7. After deployment, the site will be available at:

   `https://mitrsatya07.github.io/strata-archaeology/`

> If you choose a different repository name, replace `strata-archaeology` in the URL with that repository name.

## Local preview

Because the project uses JavaScript modules, preview it with a local web server rather than opening `index.html` directly from the file system:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
