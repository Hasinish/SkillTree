import { useNavigate } from 'react-router-dom';
import SkillProgressBar from './SkillProgressBar';

export default function SkillCard({
  skill,
  to,
  onStart,
  isLearning = false,
  progress
}) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(to)}
      className="
        bg-base-100 p-5 rounded-lg shadow hover:shadow-lg 
        transition cursor-pointer border border-black
      "
    >
      <h2 className="text-xl font-semibold mb-1">{skill.name}</h2>
      <p className="text-sm opacity-75">{skill.category}</p>

      {/* Progress bar + percent only if `progress` was passed */}
      {progress !== undefined && (
        <>
          <SkillProgressBar percent={progress} />
          <p className="text-xs opacity-70 mt-1">{progress}% completed</p>
        </>
      )}

      {/* “Start Learning” button only if `onStart` was passed */}
      {onStart && (
        <button
          className="btn btn-primary btn-sm mt-4 w-full"
          disabled={isLearning}
          onClick={(e) => {
            e.stopPropagation();
            onStart(skill._id);
          }}
        >
          {isLearning ? 'Learning ✓' : 'Start Learning'}
        </button>
      )}
    </div>
  );
}
