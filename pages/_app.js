// pages/_app.js
import '../styles/globals.css';
import Header from '../components/Header';
import { AuthProvider } from '../context/AuthContext';
import { Analytics } from '@vercel/analytics/next';

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Header />
      <Component {...pageProps} />
      <Analytics />
    </AuthProvider>
  );
}
