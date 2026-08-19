/** @type {import('next').NextConfig} */
const { version } = require("./package.json")

const nextConfig = {
  reactStrictMode: false,
  agentRules: false,
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
