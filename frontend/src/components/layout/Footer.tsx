export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-tarkov-dark border-t border-tarkov-accent/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-center text-sm text-tarkov-text/60">
          &copy; {year} Tarkov Task Tracker. Not affiliated with Battlestate
          Games.
        </p>
      </div>
    </footer>
  );
}
