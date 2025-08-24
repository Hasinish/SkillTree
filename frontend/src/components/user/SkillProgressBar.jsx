
import React from "react";

export default function SkillProgressBar({ percent }) {
  return (
    <div className="w-full bg-base-200 h-5 overflow-hidden mt-2">
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
