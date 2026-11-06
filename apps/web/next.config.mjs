/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ovation/database", "@ovation/shared", "@ovation/validation"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
