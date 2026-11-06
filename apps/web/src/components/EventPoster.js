import { posterFor } from "@/lib/data";

export default function EventPoster({ event, className = "" }) {
  if (event.poster) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={event.poster} alt={event.name} className={`object-cover ${className}`} />;
  }

  const tint = posterFor(event.id);
  return (
    <div
      className={`relative flex items-end overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(155deg, ${tint}33 0%, #0b0b0e 70%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0 18px, rgba(255,255,255,0.03) 18px 19px)",
        }}
      />
      <p
        className="relative w-full break-words p-3 font-display leading-[0.85] text-paper/90"
        style={{ fontSize: "clamp(14px, 12%, 34px)" }}
      >
        {event.name}
      </p>
    </div>
  );
}
