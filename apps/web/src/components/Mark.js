export default function Mark({ className = "h-6 w-6" }) {
  return (
    <svg viewBox="0 0 48 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 16C9 6 17 1 24 1s15 5 22 15c-7 10-15 15-22 15S9 26 2 16Z"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle cx="24" cy="16" r="7" stroke="currentColor" strokeWidth="2.5" />
      <path d="M24 12v-4M24 24v-4M20 16h-4M32 16h-4" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}
