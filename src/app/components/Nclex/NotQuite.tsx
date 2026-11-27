const NotQuite = () => (
  <div
    role="status"
    className="mb-5 flex w-fit max-w-full items-center gap-x-4 rounded-2xl bg-[color-mix(in_srgb,var(--danger-color)_32%,transparent)] px-5 py-3 ring-2 ring-inset ring-[var(--danger-color)]"
  >
    <span className="text-xl font-bold leading-7 text-[var(--title-color)]">
      Not quite
    </span>
    <svg viewBox="0 0 64 56" className="-my-2 h-10 w-12 shrink-0" aria-hidden>
      <ellipse cx="32" cy="46" rx="14" ry="9.5" fill="#e4b061" />
      <ellipse cx="32" cy="48" rx="7.5" ry="7" fill="#f3d9a4" />
      <ellipse cx="24" cy="53" rx="5" ry="2.6" fill="#b9772b" />
      <ellipse cx="40" cy="53" rx="5" ry="2.6" fill="#b9772b" />
      <g className="shake-head">
        <circle cx="32" cy="23" r="17" fill="#e4b061" />
        <path
          className="shake-ear-left"
          d="M21 9 C10 7 4 20 7 31 C8 36 14 35 16 30 C18 24 20 17 24 12 Z"
          fill="#b9772b"
        />
        <path
          className="shake-ear-right"
          d="M43 9 C54 7 60 20 57 31 C56 36 50 35 48 30 C46 24 44 17 40 12 Z"
          fill="#b9772b"
        />
        <g className="shake-face">
          <ellipse cx="32" cy="30.5" rx="9.5" ry="7.2" fill="#f3d9a4" />
          <circle cx="25" cy="21.5" r="2.6" fill="#2a1d14" />
          <circle cx="39" cy="21.5" r="2.6" fill="#2a1d14" />
          <circle cx="25.9" cy="20.6" r="0.9" fill="#ffffff" />
          <circle cx="39.9" cy="20.6" r="0.9" fill="#ffffff" />
          <path
            d="M21.5 18 C23.5 17.2 26 16 27.5 14.5 M42.5 18 C40.5 17.2 38 16 36.5 14.5"
            fill="none"
            stroke="#8a5a24"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <ellipse cx="32" cy="27.5" rx="3.6" ry="2.6" fill="#2b1f17" />
          <path
            d="M32 30 L32 32.2 M27.8 35.2 C29.6 31.8 34.4 31.8 36.2 35.2"
            fill="none"
            stroke="#8a5a24"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  </div>
);

export default NotQuite;
