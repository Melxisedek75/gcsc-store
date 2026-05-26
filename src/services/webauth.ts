import ProtonWebSDK from '@proton/web-sdk'

export interface ConnectedWebAuthWallet {
  accountName: string
  permission: string
  publicKey?: string
  walletType: 'webauth'
}

interface WebAuthConnectOptions {
  restoreSession?: boolean
}

async function requestWebAuthSession(options: WebAuthConnectOptions = {}): Promise<ConnectedWebAuthWallet | null> {
  if (typeof window === 'undefined') {
    throw new Error('WebAuth can only be connected in a browser')
  }

  const result = await ProtonWebSDK({
    linkOptions: {
      endpoints: [import.meta.env.VITE_XPR_RPC_URL || 'https://proton.greymass.com'],
      restoreSession: Boolean(options.restoreSession),
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
  if (!session) return null
  const auth = session?.auth
  if (!auth?.actor) {
    throw new Error('WebAuth did not return an XPR account')
  }

  return {
    accountName: String(auth.actor),
    permission: String(auth.permission || 'active'),
    publicKey: String((session as { publicKey?: unknown }).publicKey || ''),
    walletType: 'webauth',
  }
}

export async function connectWebAuthWallet(): Promise<ConnectedWebAuthWallet> {
  const wallet = await requestWebAuthSession({ restoreSession: false })
  if (!wallet) throw new Error('WebAuth connection was cancelled')
  return wallet
}

export async function restoreWebAuthWallet(): Promise<ConnectedWebAuthWallet | null> {
  try {
    return await requestWebAuthSession({ restoreSession: true })
  } catch {
    return null
  }
}
