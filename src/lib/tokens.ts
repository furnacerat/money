export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
} as const;

export const radii = {
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  full: "9999px",
} as const;

export const shadows = {
  soft: "0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 24px rgba(0, 0, 0, 0.06)",
  medium: "0 4px 12px rgba(0, 0, 0, 0.06), 0 8px 32px rgba(0, 0, 0, 0.08)",
  lifted: "0 8px 24px rgba(0, 0, 0, 0.08), 0 16px 48px rgba(0, 0, 0, 0.1)",
  glow: (color: string) => `0 0 24px ${color}40`,
} as const;

export const transitions = {
  fast: "150ms ease-out",
  normal: "250ms ease-out",
  slow: "400ms ease-out",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;