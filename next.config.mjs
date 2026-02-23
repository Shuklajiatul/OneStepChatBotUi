/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ['http://10.10.15.194:3002'],
  },
  turbopack:{
    
  }
};

export default nextConfig;
