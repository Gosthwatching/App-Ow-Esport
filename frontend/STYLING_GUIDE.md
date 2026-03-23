# Styling & Customization Guide

## Color System

All colors in the application are managed through **CSS variables** in `frontend/src/index.css`. This makes it easy to customize the entire theme globally.

### Primary Color Variables

Edit `frontend/src/index.css` and modify the `:root` section:

```css
:root {
  /* Dark background */
  --page-bg: #07080d;

  /* Text colors */
  --text-primary: #f5f5f5;
  --text-secondary: #b3b3b3;

  /* Accent colors (orange theme) */
  --accent-strong: #ff8e2e;     /* Bright orange */
  --accent-soft: #ff9d4f;       /* Light orange */

  /* UI elements */
  --line-soft: rgba(255, 255, 255, 0.1);

  /* ... other variables ... */
}
```

### How to Change the Color Scheme

#### Option 1: Change Just the Orange Accent
1. Open `frontend/src/index.css`
2. Find the line: `--accent-strong: #ff8e2e;`
3. Replace `#ff8e2e` with your desired color (hex code)
4. Also update `--accent-soft` for the lighter variant

**Example - Change to Blue:**
```css
--accent-strong: #2563eb;  /* Bright blue */
--accent-soft: #3b82f6;    /* Light blue */
```

**Example - Change to Purple:**
```css
--accent-strong: #a855f7;  /* Bright purple */
--accent-soft: #c084fc;    /* Light purple */
```

#### Option 2: Change the Entire Theme
1. Modify all variables in `frontend/src/index.css`:
   - `--page-bg`: Main background color
   - `--text-primary`: Main text color
   - `--text-secondary`: Secondary text color
   - `--accent-strong`: Primary highlight color
   - `--accent-soft`: Secondary highlight color
   - `--line-soft`: Border/divider color

**Example - Dark Green Theme:**
```css
:root {
  --page-bg: #0f1419;
  --text-primary: #f0f8f0;
  --text-secondary: #a8d5a8;
  --accent-strong: #10b981;
  --accent-soft: #34d399;
  --line-soft: rgba(16, 185, 129, 0.1);
}
```

**Example - Light Theme:**
```css
:root {
  --page-bg: #ffffff;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --accent-strong: #ef4444;
  --accent-soft: #f87171;
  --line-soft: rgba(0, 0, 0, 0.1);
}
```

### Where Colors Are Used

- **Buttons & Interactive Elements**: Use `--accent-strong`
- **Backgrounds & Cards**: Use `--page-bg` + gradient overlays
- **Text**: Use `--text-primary` and `--text-secondary`
- **Borders & Dividers**: Use `--line-soft`
- **Hover States**: Use `--accent-soft` for lighter variants

### Files That Use Colors

1. **`frontend/src/index.css`** - Global CSS variables definition
2. **`frontend/src/App.css`** - All component styling using the CSS variables

Whenever you update CSS variables in `index.css`, all components automatically inherit the new colors!

---

## Component Styling

Each component has its own class names in `frontend/src/App.css`:

### Dashboard Components
- `.dashboard-shell` - Main container grid
- `.sidebar` - Left navigation (66px width)
- `.topbar` - Header bar
- `.dashboard-main` - Main content area
- `.dashboard-right` - Right sidebar (350px width)

### Card Components
- `.hero-card` - Welcome section with illustration
- `.metric-card` - KPI cards (Teams, Players, Heroes)
- `.content-card` - Bottom cards (recruitment metrics)
- `.calendar-card` - Calendar widget
- `.list-card` - Team/role control lists

### View Components (New!)
- `.view-content` - Container for Teams/Players/Heroes pages
- `.teams-table` - Teams management table
- `.players-grid` - Players display grid
- `.heroes-grid` - Heroes grouped by role

### Form Components
- `.auth-form` - Login/register form
- `.inline-form` - Team creation form inline
- `.role-form` - Role assignment form
- `.primary-btn` - Primary action button

---

## Animation & Transitions

Animations are defined in `App.css`:

- `@keyframes pulse` - Pulsing animation (loading screen)
- `@keyframes fadeIn` - Fade-in on page change
- Smooth transitions on hover effects (0.2s - 0.3s)

To adjust animation speed:
```css
.view-content {
  animation: fadeIn 0.3s ease-in-out;
  /* Change 0.3s to 0.5s for slower fade */
}
```

---

## Responsive Breakpoints

The app has 2 main breakpoints:

1. **1150px** - Sidebar hides, single column navigation
2. **900px** - Single column layout for all elements

Edit in `App.css`:
```css
@media (max-width: 1150px) {
  /* Tablet size adjustments */
}

@media (max-width: 900px) {
  /* Mobile size adjustments */
}
```

---

## Quick Color Customization Commands

### Via Terminal (if using CSS preprocessor in future)
```bash
# Navigate to frontend
cd frontend

# Rebuild with new styles
npm run build

# Preview changes
npm run dev
```

### Via Editor
1. Open `frontend/src/index.css`
2. Edit CSS variables in `:root {}`
3. Save file
4. Browser auto-refreshes (Vite HMR)

---

## Common Color Combinations

### Professional Orange (Current)
- Background: `#07080d`
- Accent: `#ff8e2e`
- Text: `#f5f5f5`

### Gaming Blue
- Background: `#0a0e27`
- Accent: `#00d4ff`
- Text: `#e0e0e0`

### Esports Red
- Background: `#0f0f0f`
- Accent: `#ff0055`
- Text: `#ffffff`

### Gradient Purple
- Background: `#08051a`
- Accent: `#d946ef`
- Text: `#f0f0f0`

---

## Typography

Font families are defined in `index.css`:

```css
* {
  font-family: 'Manrope', 'Sora', sans-serif;
}
```

To change fonts:
1. Update `@import` URLs from Google Fonts
2. Update `font-family` property values
3. Adjust font sizes as needed (currently: 12px, 14px, 16px, 20px, 28px)

---

## Gradients

Common gradients used:

**Card Background:**
```css
background: linear-gradient(160deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0));
```

**Accent Gradient:**
```css
background: linear-gradient(135deg, var(--accent-strong), var(--accent-soft));
```

**Page Background:**
```css
background: radial-gradient(circle at 50% 50%, rgba(255, 142, 46, 0.08), transparent),
            linear-gradient(to bottom, #07080d, #0a0a12);
```

---

## Save & Test

After changing colors:
1. Save `index.css`
2. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Changes should appear instantly in dev mode
4. Build for production: `npm run build`

---

## Need Help?

- Colors not updating? Clear browser cache
- Want to revert? Check git: `git diff frontend/src/index.css`
- Build errors? Run: `npm run build` to see detailed errors
