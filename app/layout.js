import "./globals.css";
import Providers from "./providers";

export const viewport = { width: "device-width", initialScale: 1 };

export const metadata = {
  title: "NexIT — Discover, Train, and Recruit Top Talent Seamlessly",
  description:
    "From initial screening to job placement — empower your hiring process with intelligent assessments, certified training, and verified talent matching, all in one platform.",
};

// Loaded via a <link> tag rather than next/font/google: next/font fetches
// the font files at BUILD time, which fails outright in any environment
// without outbound access to fonts.googleapis.com (this sandbox included,
// and plenty of corporate/CI networks). A <link> tag degrades gracefully —
// worst case the browser falls back to the system sans-serif in `body`.
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
