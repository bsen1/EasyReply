// pages/_app.js
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  // Component is the active page and pageProps are the props preloaded for your page.
  return <Component {...pageProps} />;
}

export default MyApp;
