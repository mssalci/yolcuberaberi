// pages/api/robots.txt.js

export default function handler(req, res) {
  res.setHeader("Content-Type", "text/plain");
  res.write(`User-agent: *
Allow: /

Sitemap: https://www.yolcuberaberi.com.tr/sitemap.xml
`);
  res.end();
}
