// frontend/src/components/user/RankBadge.jsx
import {
  AwardIcon,
  MedalIcon,
  CrownIcon,
  GemIcon,
  StarIcon,
} from "lucide-react";

/**
 * Usage:
 *  - <RankBadge rank={rank} />                          // small pill (default)
 *  - <RankBadge rank={rank} variant="circle" size="xl" showLabelBelow />  // big circular emblem
 */

const STYLES = {
  unranked: { bg: "bg-base-200", text: "text-base-content", ring: "ring-base-300", Icon: StarIcon },
  bronze:   { bg: "bg-amber-200", text: "text-amber-900",   ring: "ring-amber-300", Icon: MedalIcon },
  silver:   { bg: "bg-gray-200",  text: "text-gray-900",    ring: "ring-gray-300",  Icon: AwardIcon },
  gold:     { bg: "bg-yellow-200",text: "text-yellow-900",  ring: "ring-yellow-300",Icon: CrownIcon },
  diamond:  { bg: "bg-cyan-200",  text: "text-cyan-900",    ring: "ring-cyan-300",  Icon: GemIcon },
  mythic:   { bg: "bg-purple-200",text: "text-purple-900",  ring: "ring-purple-300",Icon: CrownIcon },
};

const SIZE = {
  sm: { box: "w-16 h-16", icon: "h-6 w-6", label: "text-xs" },
  md: { box: "w-24 h-24", icon: "h-10 w-10", label: "text-sm" },
  lg: { box: "w-32 h-32", icon: "h-14 w-14", label: "text-base" },
  xl: { box: "w-40 h-40", icon: "h-16 w-16", label: "text-lg" },
};

export default function RankBadge({
  rank,
  variant = "pill",       // "pill" | "circle"
  size = "md",            // sm | md | lg | xl  (circle variant only)
  showLabelBelow = false, // circle variant: put rank name under the circle
}) {
  const key = rank?.current?.key || "unranked";
  const name = rank?.current?.name || "Unranked";
  const { bg, text, ring, Icon } = STYLES[key] || STYLES.unranked;

  if (variant === "circle") {
    const s = SIZE[size] || SIZE.md;
    return (
      <div className="flex flex-col items-center">
        <div
          className={[
            "inline-flex items-center justify-center rounded-full shadow",
            "ring-4 ring-offset-2",
            bg,
            text,
            ring,
            s.box,
          ].join(" ")}
        >
          <Icon className={s.icon} />
        </div>
        {showLabelBelow && (
          <div className={`mt-2 font-semibold ${s.label} ${text}`}>{name}</div>
        )}
      </div>
    );
  }

  // Default: compact pill badge
  return (
    <span className={`badge ${bg} ${text} px-4 py-3 text-sm gap-2 flex items-center`}>
      <Icon className="h-4 w-4" />
      <span>{name}</span>
    </span>
  );
}
