'use client';

interface TaskCheckboxProps {
  checked: boolean;
  onChange: () => void;
}

export default function TaskCheckbox({ checked, onChange }: TaskCheckboxProps) {
  return (
    <button
      onClick={onChange}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        checked
          ? 'bg-tarkov-accent border-tarkov-accent'
          : 'bg-transparent border-tarkov-text/40 hover:border-tarkov-accent'
      }`}
      aria-label={checked ? 'Mark as incomplete' : 'Mark as complete'}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-tarkov-darker"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      )}
    </button>
  );
}
