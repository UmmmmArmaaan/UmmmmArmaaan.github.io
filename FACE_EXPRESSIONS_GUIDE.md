# Face Expressions Guide

This guide shows how each face expression should look in your portfolio.

## Expression Reference

All faces should be:
- **2:3 bust framing** (head and shoulders)
- **Square aspect ratio** (padded with transparent background)
- **WebP format** for best quality
- **Same lighting and angle** across all expressions

### Neutral Expressions (Idle)

| Expression | File | When it Appears |
|------------|------|-----------------|
| **Base** | `base.webp` | Default face, no cursor interaction |
| **Left Watching** | `l_left.webp` | Cursor is far left of face |
| **Right Watching** | `l_right.webp` | Cursor is far right of face |

### Interaction Expressions

| Expression | File | When it Appears |
|------------|------|-----------------|
| **Cross-Eyed** | `x_cross.webp` | Cursor hovers over nose area |
| **Looking Up** | `l_up.webp` | Cursor above head area |
| **Looking Down** | `l_down.webp` | Cursor below chin area |
| **Skeptical** | `x_skeptic.webp` | On release after a pull |
| **Laughing** | `x_laugh.webp` | On release after a pull |
| **Tongue Out** | `x_tongue.webp` | On release after a pull |
| **Smug** | `x_smug.webp` | On release after a pull |
| **Dizzy** | `x_dizzy.webp` | When patience is low |

### Grab Expressions

| Expression | File | When it Appears |
|------------|------|-----------------|
| **Grimace** | `g_grimace.webp` | When grabbed anywhere on face |
| **Ouch** | `g_ouch.webp` | When hair/side is grabbed |
| **Squish** | `g_squish.webp` | When cheeks are grabbed |

## How to Create Your Faces

### Option 1: Photo Editing
1. Take photos in the same pose with neutral expression
2. Use Photoshop/GIMP to create expressions:
   - Duplicate layers and modify each
   - Use layer masks to change eye position
   - Add expressions with brushes or new layers

### Option 2: AI Image Generation
Use prompts like:
```
"Cartoon face of [Name], 2:3 bust portrait, transparent background, WebP format, [expression], same lighting and angle"
```

### Key Positioning Guide

For the WebGL face-stretching to work correctly, ensure:

1. **Face outline** is visible and consistent
2. **Eyes** are at approximately 40% from top (y=0.4 in UV coordinates)
3. **Nose tip** is the reference point for cross-eyed trigger
4. **Face fill** the image with some margin (face should be centered)

### Technical Specs

- **Dimensions**: 1536x1536px or similar square size (larger is better)
- **Format**: WebP with transparency
- **Face landmark positions** (from engine.ts):
  - Disc center: x=0.5, y=0.58
  - Nose: x=0.505, y=0.505 (radius 0.04)
  - Cheeks: (0.385, 0.53) and (0.625, 0.53)

## Current Implementation

The face stretches when grabbed based on:
- **Grab above jaw** = ears/side hair stretch (ouch face)
- **Grab cheeks horizontally** = cheek squish
- **Grab anywhere else** = grimace

Patience decreases with each pull, eventually showing the dizzy expression.