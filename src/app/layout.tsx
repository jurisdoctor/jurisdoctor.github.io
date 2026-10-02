import type { Metadata } from "next";
import LavaBackground from "./components/LavaBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "tom",
  description: "site de tom",
};

// Dark is the default theme (see globals.css), so only an explicit stored
// choice of "light" needs an attribute before paint — anything else (no
// choice yet, or a stored "dark") already renders correctly with no
// attribute at all, so there's nothing to flash.
const THEME_SCRIPT = `(function(){try{if(localStorage.getItem("theme")==="light"){document.documentElement.setAttribute("data-theme","light");}}catch(e){}})();`;

// GitHub's own "Enforce HTTPS" toggle has knocked this domain's TLS offline
// at their edge each time it was switched on, so the upgrade from http to
// https is done here instead. Scoped to the real domain so localhost and the
// github.io fallback are never redirected.
const HTTPS_SCRIPT = `(function(){if(location.protocol==="http:"&&/(^|\\.)icutom\\.com$/.test(location.hostname)){location.replace("https://"+location.host+location.pathname+location.search+location.hash);}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: HTTPS_SCRIPT }} />
        {/* Google Sans was only made public under the SIL Open Font License
            in December 2025, after this project's installed Next.js 14 last
            synced its bundled next/font/google family list — so it isn't
            importable through next/font yet, even though it's live on
            Google's own CDN. Loaded as a plain stylesheet link instead. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <LavaBackground />
        {children}
      </body>
    </html>
  );
}
