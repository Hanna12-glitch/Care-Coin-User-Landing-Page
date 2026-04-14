import { SupportedWallet, WalletId, WalletManager, WalletProvider } from '@txnlab/use-wallet-react'
import { Analytics } from '@vercel/analytics/react'
import { SnackbarProvider } from 'notistack'
import { useMemo } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Dashboard from './Dashboard'
import Home from './Home'
import Layout from './Layout'
import Onboarding from './Onboarding'
import Redeem from './Redeem'
import ThankYou from './ThankYou'
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

const web3AuthClientId = (import.meta.env.VITE_WEB3AUTH_CLIENT_ID ?? '').trim()

function buildSupportedWallets(): SupportedWallet[] {
  if (import.meta.env.VITE_ALGOD_NETWORK === 'localnet') {
    const kmdConfig = getKmdConfigFromViteEnvironment()
    return [
      {
        id: WalletId.KMD,
        options: {
          baseServer: kmdConfig.server,
          token: String(kmdConfig.token),
          port: String(kmdConfig.port),
        },
      },
      { id: WalletId.LUTE },
    ]
  }

  const wallets: SupportedWallet[] = [{ id: WalletId.PERA }, { id: WalletId.DEFLY }, { id: WalletId.LUTE }]

  if (web3AuthClientId) {
    wallets.push({
      id: WalletId.WEB3AUTH,
      options: {
        clientId: web3AuthClientId,
        web3AuthNetwork: 'sapphire_devnet',
        uiConfig: { appName: 'Project Care Coin', mode: 'auto' },
        modalConfig: {
          auth: {
            label: 'auth',
            loginMethods: {
              google:             { name: 'google',             showOnModal: false },
              facebook:           { name: 'facebook',           showOnModal: false },
              reddit:             { name: 'reddit',             showOnModal: false },
              discord:            { name: 'discord',            showOnModal: false },
              twitter:            { name: 'twitter',            showOnModal: false },
              apple:              { name: 'apple',              showOnModal: false },
              line:               { name: 'line',               showOnModal: false },
              github:             { name: 'github',             showOnModal: false },
              kakao:              { name: 'kakao',              showOnModal: false },
              linkedin:           { name: 'linkedin',           showOnModal: false },
              twitch:             { name: 'twitch',             showOnModal: false },
              weibo:              { name: 'weibo',              showOnModal: false },
              wechat:             { name: 'wechat',             showOnModal: false },
              farcaster:          { name: 'farcaster',          showOnModal: false },
              sms_passwordless:   { name: 'sms_passwordless',   showOnModal: false },
              email_passwordless: { name: 'email_passwordless', showOnModal: true  },
            },
          },
        },
      } as any,
    })
  }

  return wallets
}

export default function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment()
  const supportedWallets = useMemo(() => buildSupportedWallets(), [])
  const walletManager = useMemo(() => {
    return new WalletManager({
      wallets: supportedWallets,
      defaultNetwork: algodConfig.network,
      networks: {
        [algodConfig.network]: {
          algod: {
            baseServer: algodConfig.server,
            port: algodConfig.port,
            token: String(algodConfig.token),
          },
        },
      },
      options: { resetNetwork: true },
    })
  }, [algodConfig.network, algodConfig.server, algodConfig.port, algodConfig.token, supportedWallets])

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider manager={walletManager}>
        <BrowserRouter>
          <Analytics />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="/redeem" element={<Redeem />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </SnackbarProvider>
  )
}