import ProtonWebSDK from '@proton/web-sdk'

export const XPR_TESTNET_CHAIN_ID =
  import.meta.env.VITE_XPR_TESTNET_CHAIN_ID ||
  '71ee83bcf52142d61019d95f9cc5427ba6a0d7ff8accd9e2088ae2abeaf3d3dd'

const DEFAULT_TESTNET_ENDPOINTS = [
  'https://test.proton.eosusa.io',
  'https://testnet-api.alvosec.com',
  'https://proton-testnet.cryptolions.io',
]

const REQUEST_ACCOUNT = 'gcsctoken111'

export interface ConnectedWebAuthWallet {
  accountName: string
  permission: string
  publicKey?: string
  walletType: 'webauth'
}

export interface WebAuthSigningSession {
  auth: {
    actor: string
    permission: string
  }
  chainId?: string
  transact: (args: unknown, options?: unknown) => Promise<unknown>
}

export interface ConnectedWebAuthSession {
  wallet: ConnectedWebAuthWallet
  session: WebAuthSigningSession
}

export interface WebAuthConnectOptions {
  restoreSession?: boolean
  endpoints?: string[]
  chainId?: string
}

function wipeStuckOverlay() {
  if (typeof document === 'undefined') return
  document
    .querySelectorAll(
      '.proton-dialog, .proton-modal, .proton-prompt, iframe[src*="webauth"], iframe[src*="proton"]',
    )
    .forEach((node) => node.parentElement?.removeChild(node))
  document.body.style.overflow = ''
}

async function requestWebAuthSession(
  options: WebAuthConnectOptions = {},
): Promise<ConnectedWebAuthSession | null> {
  if (typeof window === 'undefined') {
    throw new Error('WebAuth can only be connected in a browser')
  }

  const endpoints = options.endpoints?.length
    ? options.endpoints
    : (import.meta.env.VITE_XPR_RPC_URL
        ? String(import.meta.env.VITE_XPR_RPC_URL)
            .split(',')
            .map((item: string) => item.trim())
            .filter(Boolean)
        : DEFAULT_TESTNET_ENDPOINTS)

  try {
    const result = await ProtonWebSDK({
      linkOptions: {
        endpoints,
        chainId: options.chainId || XPR_TESTNET_CHAIN_ID,
        restoreSession: Boolean(options.restoreSession),
      },
      transportOptions: {
        requestAccount: REQUEST_ACCOUNT,
      },
      selectorOptions: {
        enabledWalletTypes: ['webauth', 'proton'],
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
    if (typeof session.transact !== 'function') {
      throw new Error('WebAuth did not return a signing session')
    }

    const wallet: ConnectedWebAuthWallet = {
      accountName: String(auth.actor),
      permission: String(auth.permission || 'active'),
      publicKey: String((session as { publicKey?: unknown }).publicKey || ''),
      walletType: 'webauth',
    }
    const signingSession: WebAuthSigningSession = {
      auth: {
        actor: wallet.accountName,
        permission: wallet.permission,
      },
      chainId: String((session as { chainId?: unknown }).chainId || XPR_TESTNET_CHAIN_ID),
      transact: (args, transactOptions) =>
        session.transact(
          args as Parameters<typeof session.transact>[0],
          transactOptions as Parameters<typeof session.transact>[1],
        ),
    }

    return {
      wallet,
      session: signingSession,
    }
  } catch (error) {
    wipeStuckOverlay()
    throw error
  }
}

export async function connectWebAuthSession(
  options: WebAuthConnectOptions = {},
): Promise<ConnectedWebAuthSession | null> {
  if (options.restoreSession) {
    return requestWebAuthSession({ ...options, restoreSession: true })
  }
  try {
    const restored = await requestWebAuthSession({ ...options, restoreSession: true })
    if (restored) return restored
  } catch {
    /* no saved session */
  }
  return requestWebAuthSession({ ...options, restoreSession: false })
}

export async function connectWebAuthWallet(): Promise<ConnectedWebAuthWallet> {
  const connected = await connectWebAuthSession({ restoreSession: false })
  if (!connected) throw new Error('WebAuth connection was cancelled. Allow popups for gcsc.store and try again.')
  return connected.wallet
}

export async function restoreWebAuthWallet(): Promise<ConnectedWebAuthWallet | null> {
  try {
    const connected = await requestWebAuthSession({ restoreSession: true })
    return connected?.wallet || null
  } catch {
    wipeStuckOverlay()
    return null
  }
}
