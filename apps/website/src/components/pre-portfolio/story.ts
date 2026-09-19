export const STORY_SPEAKER_IDS = [
  'storyteller',
  'engineer',
  'pm',
  'designer',
  'tamas',
] as const

export type StorySpeakerId = (typeof STORY_SPEAKER_IDS)[number]

export type StoryBeat = {
  id: string
  speaker: StorySpeakerId
  line: string
  /** Unused until Grok voice clips exist. */
  audioSrc?: string
}

export const STORY: StoryBeat[] = [
  // Arrival
  {
    id: 'welcome',
    speaker: 'storyteller',
    line: 'Welcome to Tamas Palecian’s website.',
  },
  {
    id: 'please-hold',
    speaker: 'storyteller',
    line: 'Please hold. I am supposed to have a crew for this.',
  },
  {
    id: 'engineer-arrives',
    speaker: 'engineer',
    line: 'I am here. The website is not.',
  },
  {
    id: 'not-the-script',
    speaker: 'storyteller',
    line: 'That is not the welcome script.',
  },
  {
    id: 'script-404',
    speaker: 'engineer',
    line: 'The welcome script 404’d. I checked the network tab.',
  },

  // Scope
  {
    id: 'pm-arrives',
    speaker: 'pm',
    line: 'Hi. I own the timeline. The timeline does not own us back.',
  },
  {
    id: 'six-sprints',
    speaker: 'pm',
    line: 'We are six sprints into ‘just a simple portfolio’.',
  },
  {
    id: 'six-sprints-loader',
    speaker: 'designer',
    line: 'Correction. We are six sprints into the loader.',
  },
  {
    id: 'sticky-note',
    speaker: 'designer',
    line: 'The liquid name took three days. The work page is a sticky note that says ‘work page’.',
  },
  {
    id: 'sticky-responsive',
    speaker: 'engineer',
    line: 'I can make the sticky note responsive.',
  },
  {
    id: 'please-do-not',
    speaker: 'pm',
    line: 'Please do not.',
  },

  // Blame
  {
    id: 'carefully-directed',
    speaker: 'storyteller',
    line: 'Anyway. You are looking at a carefully directed experience.',
  },
  {
    id: 'look-at-main',
    speaker: 'engineer',
    line: 'You are looking at `main`. I would not look at `main`.',
  },
  {
    id: 'turbulence-personality',
    speaker: 'designer',
    line: 'The fill uses turbulence. That is my personality.',
  },
  {
    id: 'need-a-homepage',
    speaker: 'pm',
    line: 'Design, we still need a homepage.',
  },
  {
    id: 'this-is-the-homepage',
    speaker: 'designer',
    line: 'This is the homepage. It has a name and feelings.',
  },
  {
    id: 'asked-the-homepage',
    speaker: 'engineer',
    line: 'It does not have projects. I asked it.',
  },

  // Tamas arrives
  {
    id: 'tamas-arrives',
    speaker: 'tamas',
    line: 'Hi. I live here.',
  },
  {
    id: 'introducing-my-site',
    speaker: 'tamas',
    line: 'Why is everyone introducing my site to me?',
  },
  {
    id: 'bots-got-here-first',
    speaker: 'storyteller',
    line: 'Because the bots got here first.',
  },
  {
    id: 'on-track-for-later',
    speaker: 'pm',
    line: 'Tamas, quick status: we are on track for ‘later’.',
  },
  {
    id: 'later-than-what',
    speaker: 'tamas',
    line: 'Later than what?',
  },
  {
    id: 'later-than-the-loader',
    speaker: 'pm',
    line: 'Later than the loader. Which is done. As you saw.',
  },
  {
    id: 'youre-welcome',
    speaker: 'designer',
    line: 'You’re welcome.',
  },
  {
    id: 'asked-for-a-portfolio',
    speaker: 'tamas',
    line: 'I asked for a portfolio.',
  },
  {
    id: 'pre-is-working',
    speaker: 'engineer',
    line: 'We heard ‘pre-portfolio’. The ‘pre’ is doing a lot of work.',
  },

  // Still in development
  {
    id: 'official-word',
    speaker: 'storyteller',
    line: 'So. Official word.',
  },
  {
    id: 'dont-refresh',
    speaker: 'engineer',
    line: 'Please don’t refresh. I have not committed the real homepage.',
  },
  {
    id: 'eta-bot-color',
    speaker: 'pm',
    line: 'ETA: after Design signs off on a bot color.',
  },
  {
    id: 'brown-tablet-final',
    speaker: 'designer',
    line: 'Brown tablet. Final. Wait—',
  },
  {
    id: 'that-is-the-pm',
    speaker: 'tamas',
    line: 'That is the project manager.',
  },
  {
    id: 'pink-teardrop-final',
    speaker: 'designer',
    line: 'Then pink teardrop. Also final.',
  },
  {
    id: 'still-in-development',
    speaker: 'storyteller',
    line: 'Still in development. Scrub back if you missed a fight.',
  },
  {
    id: 'five-opinions',
    speaker: 'storyteller',
    line: 'We’re building it. Slowly. With feelings. And five opinions.',
  },
]

export const LAST_BEAT_INDEX = STORY.length - 1

export function isStorySpeakerId(value: string): value is StorySpeakerId {
  return (STORY_SPEAKER_IDS as readonly string[]).includes(value)
}

export function speakerLabel(speaker: StorySpeakerId): string {
  switch (speaker) {
    case 'storyteller':
      return 'Storyteller'
    case 'engineer':
      return 'Engineer'
    case 'pm':
      return 'Project manager'
    case 'designer':
      return 'Designer'
    case 'tamas':
      return 'Tamas'
    default: {
      const _exhaustive: never = speaker
      return _exhaustive
    }
  }
}

export function speakersUpTo(beatIndex: number): StorySpeakerId[] {
  const seen = new Set<StorySpeakerId>()
  const order: StorySpeakerId[] = []

  for (let index = 0; index <= beatIndex; index++) {
    const speaker = STORY[index]?.speaker
    if (!speaker || seen.has(speaker)) continue
    seen.add(speaker)
    order.push(speaker)
  }

  return order
}

export function beatDurationMs(line: string, reduceMotion: boolean): number {
  const chars = line.length
  if (reduceMotion) {
    return Math.min(1100, Math.max(480, 380 + chars * 14))
  }
  return Math.min(5000, Math.max(2200, 1500 + chars * 40))
}
