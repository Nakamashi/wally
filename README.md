# Scene Viewer

A simple static website for viewing three large scene images: Museum, Town, and Train Station. It is designed for GitHub Pages and uses only plain HTML, CSS, and JavaScript.

## Files

```text
/
  index.html
  viewer.html
  styles.css
  main.js
  viewer.js
  README.md
  /images
    Museum.jpg
    Town.jpg
    Train Station.jpg
```

The image viewer supports scene selection, zooming, panning, fit-to-screen, reset, fullscreen, mouse wheel zoom, drag-to-pan, double-click/double-tap zoom, and basic keyboard shortcuts.

## Replacing the images

Place your prepared image files in the `images` folder using these exact filenames:

- `Museum.jpg`
- `Town.jpg`
- `Train Station.jpg`

The filename `Train Station.jpg` intentionally contains a space. Do not rename it unless you also update the scene data in `main.js` and `viewer.js`.

No sample copyrighted images are included in this repository. The `images/.gitkeep` file only keeps the empty image folder available in Git.

## Testing locally

Open `index.html` directly in a web browser. No backend, database, login, build step, package manager, or local server is required.

If the image files have not been added yet, the viewer will show a message explaining which expected image path could not be loaded.

## Publishing with GitHub Pages

1. Commit and push these files to a GitHub repository.
2. In GitHub, open the repository settings.
3. Go to **Pages**.
4. Choose the branch you want to publish, usually `main`.
5. Choose the root folder, usually `/`.
6. Save the settings.
7. GitHub will provide a public Pages URL, such as `https://username.github.io/repository-name/`.

All paths are relative, so the site works on GitHub Pages project sites hosted under a repository subpath.

## Image size and compression notes

Large scene images can take time to download, especially on tablets or slower Wi-Fi. For best results:

- Use JPG for photographic or detailed scene images.
- Resize images to the largest resolution you actually need.
- Compress images before publishing to reduce loading time.
- Keep a high-quality original outside the published site in case you need to create new exports later.

## Public access warning

Anything published through normal public GitHub Pages can be accessed by anyone with the URL. Do not publish private, sensitive, licensed, or restricted images unless you are allowed to make them publicly available.
