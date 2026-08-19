/** @type {import('next').NextConfig} */
const { version } = require("./package.json")

const nextConfig = {
  reactStrictMode: false,
  agentRules: false,
  compress: false,
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
  serverExternalPackages: ["sequelize"],
  env: {
    NEXT_PUBLIC_APP_VERSION: version
  },
  turbopack: {
    root: __dirname,
    rules: {
      "*.svg": {
        loaders: [
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
        as: "*.js"
      }
    }
  }
}

module.exports = nextConfig
