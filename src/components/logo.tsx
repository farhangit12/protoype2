export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={big ? 30 : 24} height={big ? 30 : 24} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#17171a" />
        <path d="M12 4.5 L14.2 12 L12 19.5 L9.8 12Z" fill="#faf9f6" />
        <circle cx="12" cy="12" r="1.6" fill="#2f3cd1" />
      </svg>
      <span className={big ? "font-display text-3xl leading-none" : "font-display text-[22px] leading-none"}>
        Disha
      </span>
    </span>
  );
}
