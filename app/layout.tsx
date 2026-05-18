import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BERGENFOX · GVC Universe",
  description: "The official lore & animation platform of the Good Vibes Club universe. Build stories. Animate legends. Expand Vibetown.",
  icons: {
    icon: "/shaka.png",
  },
  openGraph: {
    title: "BERGENFOX · GVC Universe",
    description: "Build stories. Animate legends. Expand Vibetown.",
    images: ["/gvc-logotype.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}
