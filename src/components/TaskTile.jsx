export default function TaskTile({ children, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[118px] rounded-2xl border bg-mora-surface p-5 text-center text-base text-mora-text transition-colors hover:border-mora-accent ${
        selected ? 'border-2 border-mora-accent bg-[#1A1F0F]' : 'border-mora-border'
      }`}
    >
      {children}
    </button>
  );
}
