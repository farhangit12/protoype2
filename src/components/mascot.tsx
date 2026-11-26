import type { RoleId, StageId } from "@/lib/types";

/**
 * Original flat mascots, one per board role. The Strategist keeps the same body in every
 * stage; only its accessory changes (sprout, gear, rocket flag, summit flag).
 */
const BODY: Record<RoleId, string> = {
  strategist: "#dfe3ff",
  cmo: "#ffe1d6",
  ff: "#d7f2e3",
  cfo: "#fff1c2",
  ceo: "#ece3ff",
  coo: "#d9eefc",
  cco: "#f1e8dc",
};

const INK = "#17171a";

function Face() {
  return (
    <g>
      <ellipse cx="47" cy="62" rx="4.2" ry="5.2" fill={INK} />
      <ellipse cx="73" cy="62" rx="4.2" ry="5.2" fill={INK} />
      <circle cx="48.4" cy="60.2" r="1.3" fill="#fff" />
      <circle cx="74.4" cy="60.2" r="1.3" fill="#fff" />
      <path d="M53 74 Q60 80 67 74" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <ellipse cx="39" cy="73" rx="5" ry="3" fill="#ff9e9e" opacity="0.45" />
      <ellipse cx="81" cy="73" rx="5" ry="3" fill="#ff9e9e" opacity="0.45" />
    </g>
  );
}

function StrategistTop({ stage }: { stage: StageId }) {
  const stem = <path d="M60 28 V16" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
  switch (stage) {
    case "ideation":
      return (
        <g>
          {stem}
          <path d="M60 18 C52 18 47 12 47 6 C54 6 60 10 60 18Z" fill="#7cc79a" stroke={INK} strokeWidth="2" />
          <path d="M60 16 C67 16 72 11 72 5 C65 5 60 9 60 16Z" fill="#9ad8b1" stroke={INK} strokeWidth="2" />
        </g>
      );
    case "mvp":
      return (
        <g>
          {stem}
          <circle cx="60" cy="11" r="7" fill="#c9cdf8" stroke={INK} strokeWidth="2" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <rect key={a} x="58.5" y="1" width="3" height="4" rx="1" fill={INK} transform={`rotate(${a} 60 11)`} />
          ))}
          <circle cx="60" cy="11" r="2.4" fill={INK} />
        </g>
      );
    case "early-traction":
      return (
        <g>
          {stem}
          <path d="M60 4 C66 9 67 16 64 21 H56 C53 16 54 9 60 4Z" fill="#fff" stroke={INK} strokeWidth="2" />
          <circle cx="60" cy="12" r="2.2" fill="#2f3cd1" />
          <path d="M57 21 L60 26 L63 21Z" fill="#ffb36b" />
        </g>
      );
    case "scaling":
      return (
        <g>
          <path d="M60 28 V3" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M61 4 H76 L71 9 L76 14 H61Z" fill="#2f3cd1" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </g>
      );
  }
}

function Accessory({ role }: { role: RoleId }) {
  switch (role) {
    case "cmo":
      return (
        <g transform="translate(86 76) rotate(-18)">
          <path d="M0 6 L16 -2 V22 L0 14Z" fill="#fff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <rect x="-6" y="5" width="7" height="10" rx="2" fill="#ff8a65" stroke={INK} strokeWidth="2" />
          <path d="M21 4 Q25 10 21 16" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "ff":
      return (
        <g>
          <circle cx="94" cy="88" r="12" fill="#ffd66b" stroke={INK} strokeWidth="2" />
          <text x="94" y="93.5" textAnchor="middle" fontSize="15" fontWeight="700" fill={INK} fontFamily="Inter, sans-serif">₹</text>
        </g>
      );
    case "cfo":
      return (
        <g>
          <circle cx="47" cy="62" r="8.5" fill="none" stroke={INK} strokeWidth="2" />
          <circle cx="73" cy="62" r="8.5" fill="none" stroke={INK} strokeWidth="2" />
          <path d="M55.5 62 H64.5" stroke={INK} strokeWidth="2" />
          <rect x="83" y="78" width="22" height="18" rx="4" fill="#fff" stroke={INK} strokeWidth="2" />
          <path d="M87 91 L92 86 L96 89 L101 83" stroke="#1f7a4d" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "ceo":
      return (
        <g>
          <path d="M48 90 L60 96 L48 102Z M72 90 L60 96 L72 102Z" fill="#7c5cff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="60" cy="96" r="3" fill={INK} />
        </g>
      );
    case "coo":
      return (
        <g>
          <circle cx="94" cy="88" r="9" fill="#bfe3fa" stroke={INK} strokeWidth="2" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <rect key={a} x="92" y="74" width="4" height="5" rx="1" fill={INK} transform={`rotate(${a} 94 88)`} />
          ))}
          <circle cx="94" cy="88" r="3" fill={INK} />
        </g>
      );
    case "cco":
      return (
        <g>
          <path d="M94 74 L105 78 V87 C105 94 100 98 94 100 C88 98 83 94 83 87 V78Z" fill="#fff" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M89 87 L93 91 L100 83" stroke="#1f7a4d" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    default:
      return null;
  }
}

export function Mascot({
  role,
  stage = "ideation",
  size = 72,
  dim = false,
}: {
  role: RoleId;
  stage?: StageId;
  size?: number;
  dim?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${role} mascot`}
      style={{ opacity: dim ? 0.45 : 1, transition: "opacity 200ms" }}
    >
      {role === "strategist" && <StrategistTop stage={stage} />}
      {role !== "strategist" && <path d="M60 28 V20" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />}
      {role !== "strategist" && <circle cx="60" cy="17" r="4" fill={BODY[role]} stroke={INK} strokeWidth="2" />}
      <rect x="22" y="28" width="76" height="76" rx="30" fill={BODY[role]} stroke={INK} strokeWidth="2.6" />
      <Face />
      <Accessory role={role} />
    </svg>
  );
}
