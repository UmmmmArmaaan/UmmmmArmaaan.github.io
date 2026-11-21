<div align="center">

# Armandeep Singh — Developer Portfolio

**A personal corner of the web, built to be explored.**

An interactive, responsive portfolio featuring a playful WebGL character, thoughtful motion, hand-drawn details, and a showcase of my work as a computer science student and full-stack developer.

[**Visit the live portfolio**](https://ummmmarmaaan.github.io/) · [**GitHub**](https://github.com/UmmmmArmaaan) · [**LinkedIn**](https://www.linkedin.com/in/armandeep-singh-57a350368/)

[![Deploy Portfolio to GitHub Pages](https://github.com/UmmmmArmaaan/UmmmmArmaaan.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/UmmmmArmaaan/UmmmmArmaaan.github.io/actions/workflows/deploy.yml)
![React](https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

</div>

---

## The experience

This isn't just a list of projects. I wanted my portfolio to feel like something you can play with, while keeping the information easy to find.

- **Interactive WebGL hero:** Grab and stretch the character's face, discover different expressions, and watch the mood/patience meter react.
- **Pull-cord theme switch:** Click or pull the hanging light to switch between light and dark mode. The preference is saved locally.
- **Custom cursor:** A responsive, animated cursor with hover feedback on desktop; standard touch behavior on mobile.
- **Hand-drawn project cards:** Doodle-style SVG thumbnails, tech badges, and project detail popups.
- **Skills showcase:** A responsive grid of technologies with recognizable icons, including JavaScript, TypeScript, React, Next.js, Node.js, Express, Git, GitHub, Supabase, Vercel, Tailwind CSS, PostgreSQL, and more.
- **GitHub activity:** A contribution calendar and public profile statistics retrieved from external APIs, with a refresh option and fallback links if data isn't available.
- **Profile popup:** Click the avatar/name in the header for a short introduction and social links.
- **Designer background:** Subtle grid textures, gradients, and tech-inspired accents that adapt to the selected theme.
- **Responsive layouts:** Mobile-friendly navigation, sections, project cards, and face interaction.

## Built with

| Area | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript |
| Build tooling | Vite 6, npm |
| Styling | Tailwind CSS 4, custom CSS, SVG illustrations |
| Interactive hero | WebGL2, React hooks, pointer events |
| Data | GitHub public REST API and a third-party contributions API |
| Deployment | GitHub Pages, GitHub Actions |

The portfolio is a **static frontend application**; it does not require a server or database to run.

## Run locally

**Requirements:** Node.js 22 and npm are recommended (the deployment workflow also uses Node.js 22).

```bash
git clone https://github.com/UmmmmArmaaan/UmmmmArmaaan.github.io.git
cd UmmmmArmaaan.github.io
npm ci
npm run dev
```

Open the local URL shown by Vite (typically `http://localhost:5173/`).

### Useful commands

```bash
npm run dev      # Start the development server
npm run build    # Create a production build in dist/
npm run preview  # Preview the production build locally
npm run lint     # Type-check the project (tsc --noEmit)
```

## Project structure

```text
.github/workflows/deploy.yml   # GitHub Pages deployment
public/faces/                  # Character expression assets (WebP)
src/
  App.tsx                      # Main UI, sections, interactions
  content.ts                   # Portfolio data, projects, links, face metadata
  hooks.ts                     # Theme and headline-fitting hooks
  face/                        # Interactive WebGL face implementation
index.html
vite.config.ts
package.json
```

### Customize it

- Update your name, projects, experience, and contact details in `src/content.ts`.
- Adjust the portfolio sections, theme control, cursor, and decorative artwork in `src/App.tsx`.
- Replace or extend the character expression assets in `public/faces/`, keeping filenames consistent with the face registry in `src/content.ts`.
- Update the social profile links and the GitHub username used by the contribution section if you fork this project.

## GitHub contributions and contact

The contributions calendar uses `github-contributions-api.jogruber.de`, while repository/follower counts are requested from GitHub's public API. Results depend on third-party availability and API limits, so they may not update instantly. If fetching fails, the portfolio should offer a link to the GitHub profile rather than displaying made-up activity.

The Contact section provides GitHub/LinkedIn links, an email address, and a Gmail compose shortcut. **It does not send an email automatically**; visitors send the message through their own email account. Any subscription-style UI should be treated as a demo until connected to a real service.

## Deployment

This repository is named `UmmmmArmaaan.github.io`, so its GitHub Pages address is:

**https://ummmmarmaaan.github.io/**

The workflow in `.github/workflows/deploy.yml` runs when changes are pushed to `main`. It installs dependencies, builds the Vite application, and publishes the `dist/` directory to GitHub Pages.

To deploy your own fork, configure **Settings → Pages → Build and deployment → Source: GitHub Actions**, and make sure the Vite `base` setting matches your repository URL. A username.github.io repository uses the root path `/`.

## About me

I'm **Armandeep Singh**, a B.Tech Computer Science & Engineering student at Maharaja Ranjit Singh Punjab Technical University (2025–2029). I enjoy building useful web applications, learning how systems work, and polishing the little details that make a product feel good to use.

I also worked with **THE WISERZ** team on **MEDIINDIA CARE**, a healthcare platform developed during Smart India Hackathon 2026.

**Let's connect:** [GitHub](https://github.com/UmmmmArmaaan) · [LinkedIn](https://www.linkedin.com/in/armandeep-singh-57a350368/) · [Portfolio](https://ummmmarmaaan.github.io/)
