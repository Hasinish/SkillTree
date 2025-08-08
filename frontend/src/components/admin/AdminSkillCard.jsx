import { Link } from "react-router-dom";

export default function AdminSkillCard({ skill }) {
  return (
    <Link
      to={`/skill/${skill._id}`}
      className="
        card bg-neutral shadow hover:shadow-lg transition
        border border-black /* static black */"
    >
      <div className="card-body">
        <div className="flex items-start justify-between gap-3">
          <h3 className="card-title text-lg flex-1 break-words">
            {skill.name}
          </h3>
          <span
            className="badge badge-primary px-4 py-[6px] text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[10rem]"
            title={skill.category}
          >
            {skill.category}
          </span>
        </div>
        <p className="text-sm opacity-70 mt-1">
          {skill.tasks.length} task{skill.tasks.length !== 1 && "s"}
        </p>
      </div>
    </Link>
  );
}
