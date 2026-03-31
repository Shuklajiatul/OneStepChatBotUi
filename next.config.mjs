/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ["http://10.10.15.194:3002"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '10.10.15.194',
        port: '3006',
        pathname: '/api/media/**',
      },
    ],
  },

  turbopack: {},
};

export default nextConfig;
