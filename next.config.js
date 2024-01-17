/** @type {import('next').NextConfig} */
const { version } = require("./package.json")

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
  publicRuntimeConfig: {
    version
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
          }
        ]
      }
    ]
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
