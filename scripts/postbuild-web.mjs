import fs from "node:fs/promises";
import path from "node:path";

const file = path.join(process.cwd(), "dist", "index.html");
let html = await fs.readFile(file, "utf8");
const description = "Run your golf coaching business with student CRM, scheduling, practice plans, progress tracking, and payment status in one workspace.";

html = html.replace(
  /<meta name="description" content="[^"]*">/,
  `<meta name="description" content="${description}">`,
);

const metadata = [
  '<link rel="canonical" href="https://teelesson.app/">',
  '<link rel="manifest" href="/site.webmanifest">',
  '<meta name="robots" content="index,follow,max-image-preview:large">',
  '<meta property="og:title" content="TeeLesson | Golf coach management software">',
  `<meta property="og:description" content="${description}">`,
  '<meta property="og:type" content="website">',
  '<meta property="og:url" content="https://teelesson.app/">',
  '<meta property="og:image" content="https://teelesson.app/social-card.png">',
  '<meta property="og:image:width" content="1200">',
  '<meta property="og:image:height" content="630">',
  '<meta property="og:image:alt" content="TeeLesson golf coaching dashboard">',
  '<meta name="twitter:card" content="summary_large_image">',
  '<meta name="twitter:title" content="TeeLesson | Golf coach management software">',
  `<meta name="twitter:description" content="${description}">`,
  '<meta name="twitter:image" content="https://teelesson.app/social-card.png">',
].join("\n");

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TeeLesson",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  url: "https://teelesson.app/",
  description,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "14-day free trial",
  },
};

html = html.replace(
  "</head>",
  `${metadata}\n<script type="application/ld+json">${JSON.stringify(structuredData)}</script>\n</head>`,
);
await fs.writeFile(file, html);
console.log("Injected canonical, manifest, robots, social, and structured metadata.");
