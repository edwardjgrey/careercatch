// pages/_app.js - Updated with i18n support
import '../styles/globals.css'
import { SessionProvider } from 'next-auth/react'
import { appWithTranslation } from 'next-i18next'

function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default appWithTranslation(App)