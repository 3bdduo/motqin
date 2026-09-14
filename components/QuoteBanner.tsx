export function QuoteBanner({ text }: { text: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl2 bg-brand-600 px-5 py-4 text-white shadow-soft">
      <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -right-4 h-20 w-20 rounded-full bg-white/10" />
      <p className="relative flex items-start gap-2 text-sm font-bold leading-relaxed">
        <span aria-hidden>❤️</span>
        <span>{text}</span>
      </p>
    </div>
  );
}
