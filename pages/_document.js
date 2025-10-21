import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  const GTM_ID = 'GTM-TQMHFCJT'; // Your GTM ID

  return (
    <Html lang='en'>
      <Head>
        <link rel='preconnect' href='https://fonts.googleapis.com'></link>
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossorigin
        ></link>
        <link
          href='https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@100..900&display=swap'
          rel='stylesheet'
        ></link>

        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />
      </Head>
      <body className='antialiased'>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `
              <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
