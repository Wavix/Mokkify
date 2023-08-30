import { Html, Head, Main, NextScript } from "next/document"
import Script from "next/script"

const Document = () => {
  return (
    <Html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="Description" content="Webhook service" />
      <Script crossOrigin="anonymous" src="https://polyfill.io/v3/polyfill.min.js" />
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;1,100;1,300;1,400;1,500;1,700&family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default Document
