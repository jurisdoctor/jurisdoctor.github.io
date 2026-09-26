const Shapes = () => {
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-0 h-full w-full">
      <svg
        width="27"
        height="29"
        className="absolute left-[2%] top-[10%] animate-drift1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21.15625.60099c4.37954 3.67487 6.46544 9.40612 5.47254 15.03526-.9929 5.62915-4.91339 10.30141-10.2846 12.25672-5.37122 1.9553-11.3776.89631-15.75715-2.77856l2.05692-2.45134c3.50315 2.93948 8.3087 3.78663 12.60572 2.22284 4.297-1.5638 7.43381-5.30209 8.22768-9.80537.79387-4.50328-.8749-9.08872-4.37803-12.02821L21.15625.60099z"
          fill="#FFD15C"
          fillRule="evenodd"
        />
      </svg>

      <svg
        width="26"
        height="26"
        className="absolute left-[18%] top-[30%] animate-drift8"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 3.3541L2.42705 24.5h21.1459L13 3.3541z"
          stroke="#FF4C60"
          strokeWidth="3"
          fill="none"
          fillRule="evenodd"
        />
      </svg>

      {/* ring */}
      <svg
        width="26"
        height="26"
        className="absolute bottom-[30%] left-[5%] animate-drift9"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="13"
          cy="13"
          r="10"
          stroke="#44D7B6"
          strokeWidth="3"
          fill="none"
        />
      </svg>

      <svg
        width="15"
        height="23"
        className="absolute bottom-[10%] left-[2%] animate-drift7"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          transform="rotate(30 9.86603 10.13397)"
          x="7"
          width="3"
          height="25"
          rx="1.5"
          fill="#FFD15C"
          fillRule="evenodd"
        />
      </svg>

      {/* plus */}
      <svg
        width="22"
        height="22"
        className="absolute left-[44%] top-[10%] animate-drift12"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.5 0h3v9.5H22v3h-9.5V22h-3v-9.5H0v-3h9.5V0z"
          fill="#6C6CE5"
          fillRule="evenodd"
        />
      </svg>

      {/* zigzag */}
      <svg
        width="40"
        height="18"
        className="absolute bottom-[10%] left-[36%] animate-drift10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          points="2,16 11,2 20,16 29,2 38,16"
          stroke="#FF4C60"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* hexagon */}
      <svg
        width="26"
        height="30"
        className="absolute right-[25%] top-[20%] animate-drift5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 1.5l11 6.5v14l-11 6.5-11-6.5V8l11-6.5z"
          stroke="#FFD15C"
          strokeWidth="2.5"
          fill="none"
          fillRule="evenodd"
        />
      </svg>

      <svg
        width="19"
        height="21"
        className="absolute bottom-[20%] right-[24%] animate-drift4"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          transform="rotate(-40 6.25252 10.12626)"
          x="7"
          width="3"
          height="25"
          rx="1.5"
          fill="#6C6CE5"
          fillRule="evenodd"
        />
      </svg>

      {/* rotated square */}
      <svg
        width="28"
        height="28"
        className="absolute right-[2%] top-[10%] animate-drift11"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="5"
          y="5"
          width="18"
          height="18"
          stroke="#6C6CE5"
          strokeWidth="3"
          fill="none"
          transform="rotate(45 14 14)"
        />
      </svg>

      {/* diagonal dot cluster */}
      <svg
        width="30"
        height="30"
        className="absolute left-[11%] top-[45%] animate-drift6"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#44D7B6" fillRule="evenodd">
          <circle cx="4" cy="4" r="3.5" />
          <circle cx="15" cy="15" r="3.5" />
          <circle cx="26" cy="26" r="3.5" />
        </g>
      </svg>

      {/* star */}
      <svg
        width="26"
        height="25"
        className="absolute bottom-[10%] right-[2%] animate-drift3"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M13 0l3.21 6.73 7.41.98-5.4 5.13 1.42 7.35L13 16.7l-6.64 3.49 1.42-7.35-5.4-5.13 7.41-.98L13 0z"
          fill="#FFD15C"
          fillRule="evenodd"
        />
      </svg>
    </div>
  );
};

export default Shapes;
