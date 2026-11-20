export const person = {
  name: 'Armandeep Singh',
  handle: '@armaansingh',
};

export const nav = [
  {label: 'About', href: '#about'},
  {label: 'Skills', href: '#skills'},
  {label: 'Experience', href: '#experience'},
  {label: 'Projects', href: '#projects'},
  {label: 'Contact', href: '#contact'},
];

export const bio = [
  'B.Tech Computer Science & Engineering student at MRSPTU.',
  'Specializing in full-stack web development with React, Next.js, Node.js, and TypeScript.',
  'Passionate about building scalable web applications and solving complex problems.',
];

/** Tech stack I work with */
export const skills = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Express.js',
  'HTML',
  'CSS',
];

/** Education */
export const education = [
  {
    degree: 'B.Tech Computer Science & Engineering',
    institution: 'Maharaja Ranjit Singh Punjab Technical University (MRSPTU)',
    duration: '2025–2029',
  },
];

/** Hackathon experience */
export const experience = [
  {
    title: 'Smart India Hackathon 2026 – THE WISERZ',
    role: 'Technical Team Member',
    year: 2026,
    description:
      'Worked in a six-member technical team to develop a working MVP for MEDIINDIA CARE - a full-stack healthcare platform. Contributed to development, integration, debugging, testing, and used Git and GitHub for collaborative development.',
  },
];

/** Projects - Personal portfolio showcase */
export const projects = [
  {
    name: 'My Portfolio',
    description: 'Personal portfolio website showcasing my projects, skills, and experience with interactive WebGL face animations.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'WebGL', 'TypeScript'],
    github: 'https://github.com/UmmmmArmaaan/my-portfolio',
  },
  {
    name: 'Mini Task Manager',
    description: 'A simple task management application built with React and Supabase, featuring CRUD operations and user authentication.',
    tech: ['React', 'Supabase', 'TypeScript', 'CSS'],
    github: 'https://github.com/UmmmmArmaaan/mini-task-manager',
  },
  {
    name: 'MediIndia Care',
    description: 'Smart India Hackathon 2026 submission - A full-stack healthcare platform that helps discover hospitals, doctors, and treatments.',
    tech: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Express.js', 'Supabase'],
    github: 'https://github.com/UmmmmArmaaan/MediIndiaCare',
  },
];

/** Contact info - phone removed as requested */
export const contact = {
  location: 'Bathinda, Punjab, India',
  email: 'armaansingh6469@gmail.com',
};

/** Languages */
export const languages = ['English', 'Hindi'];

/**
 * Every expression is registered to the same 2:3 bust framing, padded to a
 * square, so they swap in place. A file that fails to load falls back to the base face
 * (a missing grab face falls back to g_grimace).
 */
export const faces = {
  base: {src: '/faces/base.webp', mood: 'chill'},
  l_left: {src: '/faces/l_left.webp', mood: 'watching you'},
  l_right: {src: '/faces/l_right.webp', mood: 'watching you'},
  l_up: {src: '/faces/l_up.webp', mood: 'looking up'},
  l_down: {src: '/faces/l_down.webp', mood: 'looking down'},
  x_cross: {src: '/faces/x_cross.webp', mood: 'suspicious'},
  x_tongue: {src: '/faces/x_tongue.webp', mood: 'goofy'},
  x_shock: {src: '/faces/x_shock.webp', mood: 'startled'},
  x_laugh: {src: '/faces/x_laugh.webp', mood: 'cackling'},
  x_skeptic: {src: '/faces/x_skeptic.webp', mood: 'unconvinced'},
  x_whistle: {src: '/faces/x_whistle.webp', mood: 'innocent'},
  x_smug: {src: '/faces/x_smug.webp', mood: 'smug'},
  x_dizzy: {src: '/faces/x_dizzy.webp', mood: 'seeing stars'},
  g_grimace: {src: '/faces/g_grimace.webp', mood: 'being squeezed'},
  g_ouch: {src: '/faces/g_ouch.webp', mood: 'OW'},
  g_squish: {src: '/faces/g_squish.webp', mood: 'pinched'},
} as const;

export type FaceKey = keyof typeof faces;

/** Faces dealt at random when a stretch is let go. */
export const releaseFaces: FaceKey[] = ['x_tongue', 'x_laugh', 'x_skeptic', 'x_whistle', 'x_smug', 'x_cross'];

/**
 * Landmarks in image UV (0–1, v from the top) measured on the prepared faces
 * (2:3 busts padded to square, so the sweater spans u 0.167–0.833 and meets
 * the frame edge from v 0.845 down). The disc is drawn in the same space and
 * sized so its arc clips the shoulders before they reach those edges.
 */
export const rig = {
  disc: {x: 0.5, y: 0.58, r: 0.41},
  nose: {x: 0.505, y: 0.505, r: 0.04},
  cheeks: [
    {x: 0.385, y: 0.53},
    {x: 0.625, y: 0.53},
  ],
  face: {x: 0.5, y: 0.51, rx: 0.175, ry: 0.23},
  hairLine: 0.26,
  /** |u − 0.5| beyond which a grab above the jaw is the ears / side hair. */
  sides: 0.19,
};