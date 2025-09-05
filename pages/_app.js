// pages/_app.js
import '../styles/globals.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  // Component is the active page and pageProps are the props preloaded for your page.
  return (
    <>
      <Head>
        <link rel="icon" href="/easyreply_logo.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/easyreply_logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/easyreply_logo.png" />
        <meta name="theme-color" content="#4f46e5" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
