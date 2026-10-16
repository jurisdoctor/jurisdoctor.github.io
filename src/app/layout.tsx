import type { Metadata } from "next";
import LavaBackground from "./components/LavaBackground";
import TiltEffect from "./components/Tilt/TiltEffect";
import "./globals.css";

export const metadata: Metadata = {
  title: "tom",
  description: "site de tom",
};

const WEBKIT_SCRIPT = `(function(){try{var u=navigator.userAgent;if(/iP(hone|ad|od)/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1)||/[?&]lava=canvas/.test(location.search)){document.documentElement.classList.add("no-goo");}}catch(e){}})();`;

const THEME_SCRIPT = `(function(){try{if(localStorage.getItem("theme")==="light"){document.documentElement.setAttribute("data-theme","light");}}catch(e){}})();`;

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
        <script dangerouslySetInnerHTML={{ __html: WEBKIT_SCRIPT }} />
      </head>
      <body>
        <LavaBackground />
        <TiltEffect />
        {children}
      </body>
    </html>
  );
}
