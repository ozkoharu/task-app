'use client';

import { Trader } from '@/types';
import { StatusFilter } from '@/hooks/useTaskFilter';

interface TaskFilterProps {
  traders: Trader[];
  traderId: string;
  status: StatusFilter;
  search: string;
  resultCount: number;
  onTraderChange: (traderId: string) => void;
  onStatusChange: (status: StatusFilter) => void;
  onSearchChange: (search: string) => void;
  onClear: () => void;
}

export default function TaskFilter({
  traders,
  traderId,
  status,
  search,
  resultCount,
  onTraderChange,
  onStatusChange,
  onSearchChange,
  onClear,
}: TaskFilterProps) {
  const hasFilters = traderId !== 'all' || status !== 'all' || search !== '';

  return (
    <div className="bg-tarkov-dark rounded-lg p-4 border border-tarkov-accent/30 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Trader filter */}
        <div>
          <label
            htmlFor="trader-filter"
            className="block text-sm text-tarkov-text/60 mb-1"
          >
            Trader
          </label>
          <select
            id="trader-filter"
            value={traderId}
            onChange={(e) => onTraderChange(e.target.value)}
            className="w-full bg-tarkov-darker border border-tarkov-accent/30 rounded px-3 py-2 text-tarkov-text focus:outline-none focus:border-tarkov-accent"
          >
            <option value="all">All Traders</option>
            {traders.map((trader) => (
              <option key={trader.id} value={trader.id}>
                {trader.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div>
          <label className="block text-sm text-tarkov-text/60 mb-1">
            Status
          </label>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'incomplete', label: 'Incomplete' },
              { value: 'completed', label: 'Completed' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => onStatusChange(option.value as StatusFilter)}
                className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                  status === option.value
                    ? 'bg-tarkov-accent text-tarkov-darker'
                    : 'bg-tarkov-darker text-tarkov-text hover:bg-tarkov-accent/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div>
          <label
            htmlFor="search-filter"
            className="block text-sm text-tarkov-text/60 mb-1"
          >
            Search
          </label>
          <input
            id="search-filter"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by task name..."
            className="w-full bg-tarkov-darker border border-tarkov-accent/30 rounded px-3 py-2 text-tarkov-text placeholder-tarkov-text/40 focus:outline-none focus:border-tarkov-accent"
          />
        </div>
      </div>

      {/* Results and clear */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-tarkov-text/60">{resultCount} tasks found</span>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-tarkov-accent hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
