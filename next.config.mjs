/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // <CHANGE> Added experimental flag to force clean rebuild
  experimental: {
    turbotrace: {
      logLevel: 'error'
    }
  }
}

export default nextConfig
