
export const NoImage = () => (
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" role="img" aria-label="No image available">
  <defs>
    <linearGradient id="bg" x1="120" y1="120" x2="680" y2="680" gradientUnits="userSpaceOnUse">
      <stop stopColor="#22C55E"/>
      <stop offset="1" stopColor="#0EA5E9"/>
    </linearGradient>

    <linearGradient id="stroke" x1="220" y1="260" x2="580" y2="540" gradientUnits="userSpaceOnUse">
      <stop stopColor="#0EA5E9"/>
      <stop offset="1" stopColor="#22C55E"/>
    </linearGradient>

    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#0B1220" floodOpacity="0.18"/>
    </filter>
  </defs>

  {/*<!-- Background -->*/}
  <rect x="60" y="60" width="680" height="680" rx="72" fill="url(#bg)" filter="url(#shadow)"/>

  {/*<!-- Inner card -->*/}
  <rect x="140" y="170" width="520" height="420" rx="44" fill="#ffffff" fillOpacity="0.92"/>
  <rect x="140" y="170" width="520" height="420" rx="44" fill="none" stroke="#E5E7EB" strokeWidth="6"/>

  {/* Simple image icon */}
  <rect x="220" y="260" width="360" height="240" rx="28" fill="#F9FAFB" stroke="url(#stroke)" strokeWidth="8"/>
  <circle cx="310" cy="330" r="22" fill="#94A3B8"/>
  <path d="M250 465 L350 375 L420 435 L475 395 L550 465" fill="none" stroke="#94A3B8" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>

  {/* Label */}
  <text x="400" y="565" textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
        fontSize="28" fontWeight="800" fill="#0B1220" opacity="0.88">
    NO IMAGE
  </text>
  {/* <text x="400" y="602" textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
        fontSize="18" fontWeight="600" fill="#475569" opacity="0.9">
    Available
  </text> */}

  {/* Decorative dots */}
  <g fill="#ffffff" fillOpacity="0.85">
    <circle cx="170" cy="115" r="8"/>
    <circle cx="630" cy="120" r="6"/>
    <circle cx="690" cy="680" r="7"/>
    <circle cx="120" cy="670" r="6"/>
  </g>
</svg>)
