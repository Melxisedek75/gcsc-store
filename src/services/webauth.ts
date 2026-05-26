import ProtonWebSDK from '@proton/web-sdk'

export interface ConnectedWebAuthWallet {
  accountName: string
  permission: string
  publicKey?: string
  walletType: 'webauth'
}

export async function connectWebAuthWallet(): Promise<ConnectedWebAuthWallet> {
  if (typeof window === 'undefined') {
    throw new Error('WebAuth can only be connected in a browser')
  }

  const result = await ProtonWebSDK({
    linkOptions: {
      endpoints: [import.meta.env.VITE_XPR_RPC_URL || 'https://proton.greymass.com'],
      restoreSession: false,
    },
    transportOptions: {
      requestAccount: 'gcsc.store',
    },
    selectorOptions: {
      enabledWalletTypes: ['webauth'],
      walletType: 'webauth',
    },
    uiOptions: {
      theme: 'light',
      appInfo: {
        name: 'GCSC Smart Contractor',
        logo: `${window.location.origin}/gcsc-logo-round.png`,
        logoRounded: true,
      },
    },
  })

  if (result.error) {
    throw new Error(result.error.message || 'WebAuth connection was cancelled')
  }

  const session = result.session || result.loginResult?.session
  const auth = session?.auth
  if (!auth?.actor) {
    throw new Error('WebAuth did not return an XPR account')
  }

  return {
    accountName: String(auth.actor),
    permission: String(auth.permission || 'active'),
    walletType: 'webauth',
  }
}
