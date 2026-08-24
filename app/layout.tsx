import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'PulseMind AI — Health Risk Screening & Medical Jargon Decoder',
  description: 'AI-powered clinical triage, symptom risk screening, medical jargon & lab result decoder, and personalized vital tracker.',
  openGraph: {
    title: 'PulseMind AI — Health Risk Screening & Medical Jargon Decoder',
    description: 'AI-powered clinical triage, symptom risk screening, medical jargon & lab result decoder, and personalized vital tracker.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PulseMind AI — Health Risk Screening & Medical Jargon Decoder',
    description: 'AI-powered clinical triage, symptom risk screening, medical jargon & lab result decoder, and personalized vital tracker.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
