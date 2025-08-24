import { useNavigate } from "react-router-dom";
import {
  TagIcon,
  ClipboardListIcon,
  ArrowRightCircleIcon,
} from "lucide-react";
import SkillProgressBar from "./SkillProgressBar";

export default function SkillCard({ skill, to, progress }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(to)}
      className="
        bg-base-100 p-5 shadow hover:shadow-lg
        transition cursor-pointer border border-primary
      "
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold flex-1">{skill.name}</h2>
        <ArrowRightCircleIcon className="h-6 w-6 text-secondary" />
      </div>

      <div className="flex items-center text-sm opacity-75 mb-4 space-x-4">
        <span className="flex items-center space-x-1">
          <TagIcon className="h-4 w-4" />
          <span>{skill.category}</span>
        </span>
        <span className="flex items-center space-x-1">
          <ClipboardListIcon className="h-4 w-4" />
          <span>{skill.tasks.length} task{skill.tasks.length !== 1 && "s"}</span>
        </span>
      </div>

      {progress !== undefined && (
        <>
          <SkillProgressBar percent={progress} />
          <p className="text-xs opacity-70 mt-1 flex items-center space-x-1">
            <span>{progress}%</span>
            <span>completed</span>
          </p>
        </>
      )}
    </div>
  );
}
