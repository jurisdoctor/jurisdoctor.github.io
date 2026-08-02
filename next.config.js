/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // `next build` and `next dev` share .next by default, so a build run while the
  // dev server is up replaces its chunks and the page starts 500ing. Set
  // NEXT_DIST_DIR to build somewhere else instead.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

module.exports = nextConfig;
