# Portfolio Instructions - Armandeep Singh

## GitHub Username: `UmmmmArmaaan`

## Project Location:
`C:\Users\armio\otis-portfolio`

## To Run Locally:
```bash
cd C:/Users/armio/otis-portfolio
npm install  # if not done yet
npm run dev
```
Site available at: http://localhost:5173/

## To Push to GitHub:
```bash
git init
git add .
git commit -m "Portfolio with Armandeep Singh branding and GitHub stats"
git branch -M main
git remote add origin https://github.com/UmmmmArmaaan/portfolio.git
git push -u origin main
```

## Key Files:
- `index.html` - HTML head with title "Armandeep Singh — Software Engineer"
- `package.json` - Project dependencies
- `src/App.tsx` - Main application with WebGL face hero
- `src/index.css` - Styling with blue theme (#2f4bf0)
- `src/content.ts` - Personal content (bio, skills, projects)
- `public/faces/` - 14 facial expression images for WebGL face

## Required:
Replace `public/faces/base.webp` and the other 13 face files with your actual photo.

## Features:
- WebGL face-stretching hero (grab and pull the face!)
- Active navigation with section highlighting
- Scroll animations
- Theme toggle (light/dark mode)
- GitHub contributions section
- Contact form