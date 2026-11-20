# Example Face Expressions for WebGL Portfolio

Below are visual examples showing how each expression should appear. Use these as reference when creating your face images.

## Legend
```
Face Layout Guide:
┌─────────────────────────────────────┐
│              HEAD                     │
│  ┌───────────────────────────────┐  │
│  │         FACE AREA               │  │
│  │                                 │  │
│  │  🟠 Disc reference point        │  │
│  │  👃 Nose (cross-eyed trigger)  │  │
│  │  👁️ Eyes (watch trigger)       │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Expression Examples with ASCII Art

### 1. BASE → Neutral/Chill
```
    👤  ┌─────────────┐
       │    BASE     │
       │  Happy,     │
       │  relaxed     │
       └─────────────┘
```
**Trigger**: Default state when no interaction

### 2. L_LEFT / L_RIGHT → Watching You
```
    👁️ ────>  ┌─────────────┐
              │   WATCHING  │
              │  Eyes turn   │
              │  to cursor  │
              └─────────────┘

    <───── 👁️  ┌─────────────┐
                    │   WATCHING   │
                    │  Eyes turn   │
                    │  to cursor  │
                    └─────────────┘
                  L_LEFT        L_RIGHT
```
**Trigger**: Cursor very left (>42% off center) or right (< -42% off center)

### 3. X_CROSS → Cross-Eyed
```
    👁️👁️  ┌─────────────┐
           │   CROSS-EYED│
           │  Eyes cross │
           │  at nose     │
           └─────────────┘
```
**Trigger**: Cursor within nose radius (0.07 * 1.4)

### 4. L_UP → Looking Up
```
    👀  ┌─────────────┐
        │   LOOKING   │
        │   UP        │
        │  (head tilt)│
        └─────────────┘
```
**NEW**: Trigger - Cursor above head (y < -0.3 relative to face center)

### 5. L_DOWN → Looking Down
```
    👇  ┌─────────────┐
        │   LOOKING   │
        │  DOWN       │
        │  (head nod) │
        └─────────────┘
```
**NEW**: Trigger - Cursor below chin (y > 0.4 relative to face center)

### 6. GRAB EXPRESSIONS

| Grab Location | Expression | Visual |
|---------------|------------|--------|
| **g_grimace** | Being squeezed | `😣` Pain, face squeezed |
| **g_ouch** | Hair grab | `😖` Ow! Side/sides of head |
| **g_squish** | Cheek grab | `😚` Squeezing cheeks |

### 7. RELEASE EXPRESSIONS (Random)

| Face | Mood | Description |
|------|------|-------------|
| `x_tongue` | 😜 Goofy | Tongue out |
| `x_laugh` | 😂 Cackling | Big laugh |
| `x_skeptic` | 🤨 Unconvinced | Side eye, raised brow |
| `x_smug` | 😏 Smug | One eyebrow raised |
| `x_dizzy` | 😵 Seeing stars | Swirly eyes, low patience |

## Implementation Notes

The WebGL engine uses UV coordinates (0-1):
- Face center: (0.5, 0.58)
- Nose tip: (0.505, 0.505) radius 0.04
- Eyes: y ≈ 0.35-0.45
- Chin: y ≈ 0.75-0.85

Vertical triggers added:
- **Above**: y < -0.3 from face center → `l_up` (looking up)
- **Below**: y > 0.4 from face center → `l_down` (looking down)

## How to Update Your Images

1. Take selfies or get photos in consistent pose
2. Create expression variations:
   - Change eye direction for `l_left`/`l_right`
   - Cross eyes, stick out tongue, etc.
3. Export as WebP with transparency
4. Drop in `/public/faces/` folder

## Testing

Run the dev server to test:
```bash
npm run dev
```

Move your cursor around the face to see expressions change!