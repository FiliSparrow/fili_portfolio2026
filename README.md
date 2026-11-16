# Maia Branson portfolio

A portfolio site built with plain HTML, CSS and JavaScript, using Vite as the dev server and Motion for animation.

## Run it

```bash
npm install
```

```bash
npm run dev
```

`npm run build` writes the finished static site to `dist/`.

## Where things are

| File | What it holds |
|---|---|
| `index.html` | The page: landing, section headings, about text and contact details |
| `src/projects.js` | All project content. Edit this to add real projects |
| `src/style.css` | All styles. Colours and fonts are set at the top |
| `src/main.js` | Page behaviour: rendering projects, scroll motion and opening a case study |
| `src/flock.js` | The ASCII butterflies |
| `src/covers.js` | The generated placeholder covers |
| `src/decode.js` | The text "decode" effect |

## Replacing the placeholders

- **Introduction, about and contact:** edit the text in `index.html`.
- **Projects:** edit `src/projects.js`. To use a real picture, put it in a `public/` folder and set `image: "/your-file.jpg"` on the project.
- **Disciplines list:** edit `disciplines` at the bottom of `src/projects.js`.

`PRODUCT.md` and `DESIGN.md` describe what the site is for and how it should look.
