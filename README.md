# Armandeep Singh's Portfolio

A interactive portfolio website built with React, Vite, TypeScript, and Tailwind CSS featuring a WebGL face-stretching hero animation.

## Features

- **Interactive WebGL Face Hero**: Grab and stretch a cartoon face that changes expressions based on where you grab it
- **Mood Meter**: Shows current mood and patience level that decreases with each pull
- **Dark Mode**: Toggle between light and dark themes, persisted across sessions
- **Responsive Design**: Adapts from mobile to desktop with fitted headline text
- **Full Stack Showcase**: About, Skills, Education, Experience, Projects, and Contact sections

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS v4** for styling
- **Raw WebGL2** for the interactive face mesh
- **Satoshi** font for the hero headline

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
npm install
npm run dev
```

The development server will be available at `http://localhost:5173/`.

### Building

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```

## Face Images

The project requires 14 WebP face images in `public/faces/`:
- `base.webp` - Neutral face
- `l_left.webp`, `l_right.webp` - Eyes following cursor
- `x_cross.webp` - Cross-eyed (nose hover)
- `x_tongue.webp` - Tongue out
- `x_shock.webp` - Startled expression
- `x_laugh.webp` - Cackling
- `x_skeptic.webp` - Skeptical
- `x_whistle.webp` - Whistling
- `x_smug.webp` - Smug
- `x_dizzy.webp` - Seeing stars (low patience release)
- `g_grimace.webp` - Being squeezed (grab face)
- `g_ouch.webp` - OW face (hair grab)
- `g_squish.webp` - Pinched cheeks face

## Contact

- **Name**: Armandeep Singh
- **Email**: armaansingh6469@gmail.com
- **Location**: Bathinda, Punjab, India

## License

MIT