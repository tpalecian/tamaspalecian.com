import { defineLive } from 'next-sanity/live'
import { client } from './client'
import { isSanityConfigured, privateToken, publicToken } from './env'

const sanityReady = isSanityConfigured() && client

const liveExports = sanityReady
  ? defineLive({
      client: client!,
      browserToken: publicToken,
      serverToken: privateToken,
    })
  : null

export const sanityFetch =
  liveExports?.sanityFetch ?? (async () => ({ data: null }))

export const SanityLive = liveExports?.SanityLive ?? (() => null)
