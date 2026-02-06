'use client';

interface OverallProgressProps {
  total: number;
  completed: number;
}

export default function OverallProgress({
  total,
  completed,
}: OverallProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-tarkov-dark rounded-lg p-6 border border-tarkov-accent/30">
      <h2 className="text-xl font-bold text-tarkov-accent mb-4">
        Overall Progress
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-tarkov-text text-lg">{percentage}%</span>
          <span className="text-tarkov-text/60 text-sm">
            {completed} / {total} tasks completed
          </span>
        </div>
        <div className="w-full bg-tarkov-darker rounded-full h-4 overflow-hidden">
          <div
            className="bg-tarkov-accent h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
