import { client } from '@repo/cms/client'
import { isSanityConfigured, privateToken } from '@repo/cms/env'
import { NextResponse } from 'next/server'
import { defineEnableDraftMode } from 'next-sanity/draft-mode'

const draftModeHandler =
  isSanityConfigured() && client
    ? defineEnableDraftMode({
        client: client.withConfig({ token: privateToken }),
      })
    : {
        GET: () =>
          NextResponse.json(
            { error: 'Sanity is not configured' },
            { status: 503 }
          ),
      }

export const { GET } = draftModeHandler
