// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.ico" />
    <link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#2563eb" />
      </Head>
      <body className="bg-white text-gray-800 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
