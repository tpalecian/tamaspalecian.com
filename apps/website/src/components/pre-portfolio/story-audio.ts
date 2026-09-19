import type { StoryBeat } from './story'

export type StoryAudioController = {
  muted: boolean
  play: (beat: StoryBeat) => void
  stop: () => void
}

/**
 * Voice-ready director hook. This environment cannot generate Grok voice,
 * so play/stop are no-ops and the scene stays muted.
 */
export function createStoryAudio(
  options: { muted?: boolean } = {}
): StoryAudioController {
  return {
    muted: options.muted ?? true,
    play(_beat: StoryBeat) {},
    stop() {},
  }
}

export const StoryAudio = createStoryAudio({ muted: true })
