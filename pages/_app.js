import '../styles/globals.css';
import Header from '../components/Header';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { Analytics } from '@vercel/analytics/next';

export default function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Header />
        <Component {...pageProps} />
        <Analytics />
      </AuthProvider>
    </LanguageProvider>
  );
}
