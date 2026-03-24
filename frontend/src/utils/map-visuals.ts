type MapVisual = {
  accent: string
  background: string
  glow: string
  shortCode: string
  subtitle: string
}

function hashString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function normalizeLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function shortCodeFromMap(code: string | null | undefined, name: string) {
  const compact = (code || name)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 3)

  return compact || 'MAP'
}

export function getMapVisual(code: string | null | undefined, name: string, type: string): MapVisual {
  const base = `${code ?? name}-${type}`
  const seed = hashString(base)
  const hueA = seed % 360
  const hueB = (hueA + 48 + (seed % 37)) % 360
  const hueC = (hueA + 140) % 360
  const accent = `hsl(${hueA} 82% 64%)`
  const glow = `hsla(${hueA} 90% 60% / 0.34)`
  const background = [
    `radial-gradient(circle at 16% 20%, hsla(${hueA} 100% 78% / 0.48), transparent 28%)`,
    `radial-gradient(circle at 84% 24%, hsla(${hueB} 100% 70% / 0.30), transparent 30%)`,
    `linear-gradient(135deg, hsl(${hueA} 62% 18%), hsl(${hueB} 70% 24%) 44%, hsl(${hueC} 68% 12%))`,
  ].join(', ')

  return {
    accent,
    glow,
    background,
    shortCode: shortCodeFromMap(code, name),
    subtitle: normalizeLabel(code ?? type),
  }
}
