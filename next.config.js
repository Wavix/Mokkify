/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/endpoints",
        permanent: true
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/api/(.*)",
        destination: "/api"
      },
      {
        source: "/backend/endpoint/:endpointId/logs",
        destination: "/backend/log"
      }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ["sequelize", "sequelize-typescript"]
  },
  webpack: config => {
    // eslint-disable-next-line no-param-reassign
    config.resolve.fallback = { fs: false }

    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: true,
            svgoConfig: {
              prefixClassNames: true
            }
          }
        }
      ],
      issuer: {
        and: [/\.(ts|tsx|js|jsx)$/]
      }
    })

    return {
      ...config
    }
  }
}

module.exports = nextConfig
