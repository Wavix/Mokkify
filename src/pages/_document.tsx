import { Html, Head, Main, NextScript } from "next/document"

const Document = () => {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <meta name="description" content="Mokkify — self-hosted REST API mocking service" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default Document
