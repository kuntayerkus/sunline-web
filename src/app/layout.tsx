import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { SITE_URL, INSTAGRAM_URL, TELEFON_GORUNUM } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  appleWebApp: {
    capable: true,
    title: "Sunline",
    statusBarStyle: "black-translucent",
  },
  title: 'Sunline | İzmir Premium Kayıt Stüdyosu ve Backline Kiralama',
  description: 'İzmir\'in en iyi premium kayıt stüdyosu ve profesyonel backline (konser ve festival ekipmanı) kiralama şirketi. Üst düzey müzik prodüksiyonu ve etkinlik çözümleri.',
  keywords: [
    'İzmir kayıt stüdyosu', 
    'backline kiralama İzmir', 
    'konser ekipmanı kiralama', 
    'premium ses stüdyosu İzmir', 
    'festival ses sistemi', 
    'Sunline Studio', 
    'müzik prodüksiyon İzmir', 
    'mix mastering İzmir',
    'davul amfi kiralama',
    'en iyi stüdyo İzmir'
  ],
  authors: [{ name: 'Sunline Studio' }],
  creator: 'Sunline',
  publisher: 'Sunline',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Sunline | İzmir Premium Kayıt Stüdyosu ve Backline Kiralama',
    description: 'İzmir\'de müzisyenler ve festival organizatörleri için üst düzey kayıt stüdyosu ve profesyonel backline kiralama hizmetleri.',
    url: SITE_URL,
    siteName: 'Sunline',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sunline | İzmir Premium Kayıt Stüdyosu',
    description: 'İzmir\'in en iyi premium kayıt stüdyosu ve profesyonel backline kiralama şirketi.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#141414",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // çentikli telefonlarda safe-area env() çalışsın
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService", "EntertainmentBusiness"],
    "name": "Sunline",
    "image": `${SITE_URL}/logo.png`,
    "@id": SITE_URL,
    "url": SITE_URL,
    "telephone": TELEFON_GORUNUM,
    "priceRange": "$$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Alsancak",
      "addressLocality": "İzmir",
      "addressRegion": "İzmir",
      "postalCode": "35000",
      "addressCountry": "TR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 38.435, 
      "longitude": 27.142 
    },
    "description": "Sunline, İzmir'de konumlanan premium müzik kayıt stüdyosu ve profesyonel backline (konser/festival ekipmanı) kiralama şirketidir. Üst düzey akustik, analog/dijital ekipmanlar ile müzisyenlere ve organizatörlere en iyi hizmeti sunar.",
    "knowsAbout": [
      "Audio Recording",
      "Backline Rental",
      "Music Production",
      "Mixing and Mastering",
      "Concert Equipment",
      "Festival Audio Setup",
      "Premium Studio Equipment"
    ],
    "areaServed": "İzmir, Turkey",
    "sameAs": [
      INSTAGRAM_URL
    ]
  };

  return (
    <html lang="tr" className={`${inter.variable} ${bricolage.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
