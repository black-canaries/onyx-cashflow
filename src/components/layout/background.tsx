export function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl" />
    </div>
  );
}
