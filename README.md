# Youssef Yasser Desktop Portfolio

An interactive desktop and Finder portfolio built with HTML, CSS, and native JavaScript modules. The original site is archived at [ChatGPT Sites](https://youssef-yasser-desktop.lively-corgi-3549.chatgpt.site/).

## Local development

Run `python -m http.server 8080 --directory dist` from this repository, then open http://localhost:8080/. Edit the files in `dist/` directly. The project uses no runtime packages, build dependencies, environment variables, or backend services.

## Vercel

Import this GitHub repository using the Other framework preset and the repository root. The included configuration serves `dist/` directly. Set the production branch to `main` to deploy on push. Project routes use URL fragments, so no rewrites are needed.
