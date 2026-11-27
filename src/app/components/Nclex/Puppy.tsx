const Puppy = () => (
  <svg viewBox="0 0 100 60" className="h-full w-full">
    <g
      className="dog-joint dog-hind-up"
      style={{
        transformOrigin: "37px 40px",
        animationDelay: "-0.31s",
      }}
    >
      <path
        d="M32 38 C38 36 42 40 40 45 L39 50 L34 50 Z"
        fill="#c98f3d"
      />
      <g
        className="dog-joint dog-hind-low"
        style={{
          transformOrigin: "38px 49px",
          animationDelay: "-0.31s",
        }}
      >
        <path
          d="M34.5 49 L39 49 L38.5 55 L35 55 Z"
          fill="#b9772b"
        />
        <path
          d="M33.5 55 C33.5 53.2 40.5 53.2 41.5 55.4 C41.5 57 33.5 57.2 33.5 55 Z"
          fill="#b9772b"
        />
      </g>
    </g>
    <g
      className="dog-joint dog-fore-up"
      style={{
        transformOrigin: "57px 40px",
        animationDelay: "-0.465s",
      }}
    >
      <path
        d="M52 38 C58 36 62 40 60 45 L59 50 L54 50 Z"
        fill="#c98f3d"
      />
      <g
        className="dog-joint dog-fore-low"
        style={{
          transformOrigin: "58px 49px",
          animationDelay: "-0.465s",
        }}
      >
        <path
          d="M54.5 49 L59 49 L58.5 55 L55 55 Z"
          fill="#b9772b"
        />
        <path
          d="M53.5 55 C53.5 53.2 60.5 53.2 61.5 55.4 C61.5 57 53.5 57.2 53.5 55 Z"
          fill="#b9772b"
        />
      </g>
    </g>
    <g className="dog-joint dog-body">
      <g
        className="dog-joint dog-tail"
        style={{ transformOrigin: "25px 35px" }}
      >
        <path
          d="M26 37 C19 37 15 31 16 24 C21 26 25 30 28 33 Z"
          fill="#e4b061"
        />
      </g>
      <path
        d="M24 34 C25 27 38 25 52 28 C60 30 62 37 59 42 C55 46 40 46 30 45 C24 44 23 39 24 34 Z"
        fill="#e4b061"
      />
      <path
        d="M28 41 C36 46 50 46 58 41 C57 46 50 49 40 49 C32 49 28 46 28 41 Z"
        fill="#f3d9a4"
      />
      <g
        className="dog-joint dog-head"
        style={{ transformOrigin: "62px 34px" }}
      >
        <path
          d="M56 30 C60 22 66 18 74 18 L78 36 C70 40 62 42 58 42 Z"
          fill="#e4b061"
        />
        <circle cx="74" cy="24" r="12" fill="#e4b061" />
        <ellipse
          cx="84.5"
          cy="28.5"
          rx="8.5"
          ry="6.2"
          fill="#f3d9a4"
        />
        <path
          d="M83 32.2 C86 34.2 90 34.2 92.5 32"
          fill="none"
          stroke="#8a5a24"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <path
          d="M86.5 33.2 C86.5 37.8 91.6 37.8 91.2 32.6 Z"
          fill="#ee8f93"
        />
        <ellipse
          cx="91.8"
          cy="25.6"
          rx="3"
          ry="2.3"
          fill="#2b1f17"
        />
        <circle
          cx="92.6"
          cy="24.9"
          r="0.7"
          fill="#ffffff"
          opacity="0.7"
        />
        <circle
          cx="78"
          cy="30"
          r="2.6"
          fill="#f2a28a"
          opacity="0.45"
        />
        <circle cx="80" cy="21" r="2.6" fill="#2a1d14" />
        <circle cx="80.9" cy="20.1" r="0.95" fill="#ffffff" />
        <circle
          cx="79.3"
          cy="22.2"
          r="0.45"
          fill="#ffffff"
          opacity="0.8"
        />
        <path
          d="M76.8 16.6 C78.4 15.6 80.6 15.8 81.8 17"
          fill="none"
          stroke="#b9772b"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <g
          className="dog-joint dog-ear"
          style={{ transformOrigin: "70px 13px" }}
        >
          <path
            d="M70 12 C60 11 57 25 62 34 C67 36 73 29 74 19 Z"
            fill="#b97a2d"
          />
          <path
            d="M68 16 C63 18 62 26 64 31"
            fill="none"
            stroke="#d09a4e"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      </g>
    </g>
    <g
      className="dog-joint dog-hind-up"
      style={{ transformOrigin: "30px 40px", animationDelay: "0s" }}
    >
      <path
        d="M25 38 C31 36 36 40 34 45 L33 50 L28 50 Z"
        fill="#e4b061"
      />
      <g
        className="dog-joint dog-hind-low"
        style={{
          transformOrigin: "31px 49px",
          animationDelay: "0s",
        }}
      >
        <path
          d="M28.5 49 L33 49 L32.5 55 L29 55 Z"
          fill="#dca653"
        />
        <path
          d="M27.5 55 C27.5 53.2 34.5 53.2 35.5 55.4 C35.5 57 27.5 57.2 27.5 55 Z"
          fill="#dca653"
        />
      </g>
    </g>
    <g
      className="dog-joint dog-fore-up"
      style={{
        transformOrigin: "53px 40px",
        animationDelay: "-0.155s",
      }}
    >
      <path
        d="M48 38 C54 36 58 40 56 45 L55 50 L50 50 Z"
        fill="#e4b061"
      />
      <g
        className="dog-joint dog-fore-low"
        style={{
          transformOrigin: "54px 49px",
          animationDelay: "-0.155s",
        }}
      >
        <path
          d="M50.5 49 L55 49 L54.5 55 L51 55 Z"
          fill="#dca653"
        />
        <path
          d="M49.5 55 C49.5 53.2 56.5 53.2 57.5 55.4 C57.5 57 49.5 57.2 49.5 55 Z"
          fill="#dca653"
        />
      </g>
    </g>
  </svg>
);

export default Puppy;
