/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep pdf-parse (and its pdfjs dependency) out of the server bundle so their
  // files resolve at runtime (fixes "couldn't extract text from the PDF").
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist"],
  },
};

module.exports = nextConfig;
