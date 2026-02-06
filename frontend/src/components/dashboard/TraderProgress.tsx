'use client';

import Image from 'next/image';
import { Trader, Task } from '@/types';

interface TraderProgressProps {
  traders: Trader[];
  tasks: Task[];
  completedTaskIds: string[];
}

export default function TraderProgress({
  traders,
  tasks,
  completedTaskIds,
}: TraderProgressProps) {
  const getTraderProgress = (traderId: string) => {
    const traderTasks = tasks.filter((task) => task.trader.id === traderId);
    const completedCount = traderTasks.filter((task) =>
      completedTaskIds.includes(task.id)
    ).length;
    const total = traderTasks.length;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    return { completed: completedCount, total, percentage };
  };

  return (
    <div className="bg-tarkov-dark rounded-lg p-6 border border-tarkov-accent/30">
      <h2 className="text-xl font-bold text-tarkov-accent mb-4">
        Progress by Trader
      </h2>
      <div className="space-y-4">
        {traders.map((trader) => {
          const progress = getTraderProgress(trader.id);
          return (
            <div key={trader.id} className="flex items-center gap-4">
              <div className="w-10 h-10 flex-shrink-0 relative rounded-full overflow-hidden bg-tarkov-darker">
                {trader.image_url ? (
                  <Image
                    src={trader.image_url}
                    alt={trader.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-tarkov-accent text-sm font-bold">
                    {trader.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-tarkov-text text-sm font-medium truncate">
                    {trader.name}
                  </span>
                  <span className="text-tarkov-text/60 text-xs ml-2">
                    {progress.completed}/{progress.total}
                  </span>
                </div>
                <div className="w-full bg-tarkov-darker rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-tarkov-accent h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
              <span className="text-tarkov-accent text-sm font-bold w-12 text-right">
                {progress.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
