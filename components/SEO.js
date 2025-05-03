// components/SEO.js
import Head from "next/head";

export default function SEO({ title, description, url, image }) {
  const defaultTitle = "Yolcu Beraberi - Uygun Yurt Dışı Alışverişi";
  const defaultDescription = "Yurt dışı alışverişlerinizi kolaylaştıran platform";
  const defaultUrl = "https://www.yolcuberaberi.com.tr";
  const defaultImage = "https://www.yolcuberaberi.com.tr/og-image.png"; // örnek görsel

  return (
    <Head>
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:url" content={url || defaultUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image || defaultImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
      <link rel="canonical" href={url || defaultUrl} />
    </Head>
  );
}
