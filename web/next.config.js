/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Next.js image optimizer. OpenNext tries to bundle an
  // "image optimization" Lambda that requires downloading Linux-only
  // binaries; this breaks on native Windows. Marking images as
  // `unoptimized` skips that step while still allowing <Image> usage.
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig; 