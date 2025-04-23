// components/SEO.js
import Head from "next/head";

export default function SEO({ title, description, url }) {
  return (
    <Head>
      <title>{title || "Yolcu Beraberi - Uygun Yurt Dışı Alışverişi"}</title>
      <meta name="description" content={description || "Yurt dışı alışverişlerinizi kolaylaştıran platform"} />
      <meta property="og:title" content={title || "Yolcu Beraberi"} />
      <meta property="og:description" content={description || "Yurt dışı alışverişlerinizi kolaylaştıran platform"} />
      <meta property="og:url" content={url || "https://www.yolcuberaberi.com.tr"} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || "Yolcu Beraberi"} />
      <meta name="twitter:description" content={description || "Yurt dışı alışverişlerinizi kolaylaştıran platform"} />
      <link rel="canonical" href={url || "https://www.yolcuberaberi.com.tr"} />
    </Head>
  );
}
