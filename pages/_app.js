// pages/_app.js
 import '../styles/globals.css';
 import Header from '../components/Header';
 
 export default function MyApp({ Component, pageProps }) {
  
   return <Component {...pageProps} />;
     }
