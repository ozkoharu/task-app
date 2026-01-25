export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-tarkov-accent mb-6">Dashboard</h1>
      <div className="bg-tarkov-dark rounded-lg p-6 border border-tarkov-accent/30">
        <p className="text-tarkov-text">
          Task progress tracker for Escape from Tarkov.
        </p>
        <p className="text-tarkov-text/60 mt-2">
          Track your task completion across all traders.
        </p>
      </div>
    </div>
  );
}
