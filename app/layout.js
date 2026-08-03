import './globals.css';
import { Providers } from './providers';
import SmoothScroll from '../components/SmoothScroll';

export const metadata = {
  title: '7th Heaven | A slice of happiness',
  description: 'Experience premium cafe vibes and delicious   in a warm, inviting atmosphere.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;700;800&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SmoothScroll>
          <Providers>
            {children}
          </Providers>
        </SmoothScroll>
      </body>
    </html>
  );
}
