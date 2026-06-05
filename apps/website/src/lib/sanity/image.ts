import { dataset, projectId } from '@repo/cms'
import createImageUrlBuilder, {
  type SanityImageSource,
} from '@sanity/image-url'

const builder = createImageUrlBuilder({ projectId, dataset })

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}
