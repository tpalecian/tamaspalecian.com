'use client'

import type { ChangeEvent, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  defaultR0ParticleLogoConfig,
  R0ParticleLogo,
  type R0ParticleLogoConfig,
} from '@/components/r0-particle-logo'
import { cn } from '@/library/cn'

type SliderControl = {
  key: keyof Omit<
    R0ParticleLogoConfig,
    | 'alternateColor'
    | 'color'
    | 'invert'
    | 'serpentine'
    | 'ditherMode'
    | 'negateLuminance'
  >
  label: string
  max: number
  min: number
  step: number
  suffix?: string
}

const algorithmControls: SliderControl[] = [
  {
    key: 'luminanceThreshold',
    label: 'Luminance Threshold (FS only)',
    min: 0,
    max: 255,
    step: 1,
  },
  {
    key: 'lightInkFloor',
    label: 'Highlight stipple floor',
    min: 0,
    max: 0.12,
    step: 0.002,
  },
]

const mainControls: SliderControl[] = [
  {
    key: 'scale',
    label: 'Layout scale',
    min: 0.05,
    max: 0.85,
    step: 0.01,
    suffix: '%',
  },
  {
    key: 'dotJitter',
    label: 'Dot Jitter',
    min: 0,
    max: 0.45,
    step: 0.01,
  },
  {
    key: 'contrast',
    label: 'Contrast',
    min: -1,
    max: 1,
    step: 0.01,
  },
  {
    key: 'gamma',
    label: 'Midtones (Gamma)',
    min: 0.2,
    max: 2.4,
    step: 0.01,
  },
  {
    key: 'highlightsCompression',
    label: 'Highlights Compression',
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: 'blurRadius',
    label: 'Blur Radius',
    min: 0,
    max: 8,
    step: 0.25,
    suffix: 'px',
  },
]

const errorControls: SliderControl[] = [
  {
    key: 'errorStrength',
    label: 'Error Strength',
    min: 0,
    max: 2,
    step: 0.01,
    suffix: '%',
  },
]

const shapeControls: SliderControl[] = [
  {
    key: 'cornerRadius',
    label: 'Corner Radius',
    min: 0,
    max: 0.5,
    step: 0.01,
    suffix: '%',
  },
]

const recordingControls: SliderControl[] = [
  {
    key: 'stippleGrid',
    label: 'Stipple grid (detail)',
    min: 128,
    max: 384,
    step: 4,
  },
  {
    key: 'pixelRatioCap',
    label: 'Max canvas DPR',
    min: 1,
    max: 8,
    step: 0.5,
  },
  {
    key: 'pixelRatioScale',
    label: 'DPR supersample ×',
    min: 0.5,
    max: 3,
    step: 0.05,
  },
]

const pointerInteractionControls: SliderControl[] = [
  {
    key: 'displacementSmoothing',
    label: 'Displacement smoothing',
    min: 0.02,
    max: 0.35,
    step: 0.005,
    suffix: '%',
  },
  {
    key: 'mouseRepelRadius',
    label: 'Mouse repel radius',
    min: 20,
    max: 200,
    step: 1,
    suffix: 'px',
  },
  {
    key: 'mouseRepelStrength',
    label: 'Mouse repel strength',
    min: 0,
    max: 80,
    step: 1,
  },
]

const shockwaveControls: SliderControl[] = [
  {
    key: 'shockwaveSpeed',
    label: 'Shockwave speed',
    min: 50,
    max: 400,
    step: 5,
  },
  {
    key: 'shockwaveWidth',
    label: 'Shockwave width',
    min: 8,
    max: 80,
    step: 1,
    suffix: 'px',
  },
  {
    key: 'shockwaveStrength',
    label: 'Shockwave strength',
    min: 0,
    max: 50,
    step: 0.5,
  },
  {
    key: 'shockwaveDuration',
    label: 'Shockwave duration',
    min: 200,
    max: 1200,
    step: 25,
    suffix: 'ms',
  },
]

const swapControls: SliderControl[] = [
  {
    key: 'swapImpulse',
    label: 'Swap impulse / click',
    min: 0.04,
    max: 0.34,
    step: 0.01,
  },
  {
    key: 'swapDecay',
    label: 'Swap retention',
    min: 0.82,
    max: 0.98,
    step: 0.005,
    suffix: '%',
  },
]

function formatValue(value: number, suffix?: string) {
  if (suffix === '%') return `${Math.round(value * 100)}%`
  if (suffix === 'px') return `${value.toFixed(value % 1 === 0 ? 0 : 2)}px`
  if (suffix === 'ms') return `${Math.round(value)}ms`
  if (value >= 10) return value.toFixed(0)
  if (value >= 1) return value.toFixed(2)
  return value.toFixed(3)
}

function normalizeHex(hex: string) {
  const value = hex.replace('#', '')
  if (value.length !== 6) return '#45403a'
  return `#${value}`
}

function colorToHex(color: [number, number, number]) {
  return `#${color
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`
}

function hexToColor(hex: string): [number, number, number] {
  const normalized = normalizeHex(hex).replace('#', '')
  return [
    Number.parseInt(normalized.slice(0, 2), 16) / 255,
    Number.parseInt(normalized.slice(2, 4), 16) / 255,
    Number.parseInt(normalized.slice(4, 6), 16) / 255,
  ]
}

function ControlGroup({
  children,
  hint,
  title,
}: {
  children: ReactNode
  hint?: string
  title: string
}) {
  return (
    <section className="rounded-lg border border-neutral-300/80 border-dashed bg-white p-4">
      <div className="mb-3 border-neutral-200 border-b border-dashed pb-3">
        <h2 className="font-semibold text-neutral-900 text-xs">{title}</h2>
        {hint ? (
          <p className="mt-1 text-[10px] text-neutral-500 leading-snug">
            {hint}
          </p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function SidebarSection({
  children,
  description,
  title,
}: {
  children: ReactNode
  description?: string
  title: string
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-neutral-900 text-sm">{title}</h3>
        {description ? (
          <p className="mt-1 text-[11px] text-neutral-500 leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function Slider({
  control,
  onChange,
  value,
}: {
  control: SliderControl
  onChange: (key: SliderControl['key'], value: number) => void
  value: number
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-[11px] text-neutral-600">
        <span>{control.label}</span>
        <span className="font-mono text-neutral-800 tabular-nums">
          {formatValue(value, control.suffix)}
        </span>
      </span>
      <input
        className="h-1.5 w-full cursor-ew-resize accent-neutral-900"
        max={control.max}
        min={control.min}
        onChange={(event) => onChange(control.key, Number(event.target.value))}
        step={control.step}
        type="range"
        value={value}
      />
    </label>
  )
}

export function R0ParticleLogoLab() {
  const [config, setConfig] = useState<R0ParticleLogoConfig>(
    defaultR0ParticleLogoConfig
  )
  const [isFullscreen, setIsFullscreen] = useState(false)
  const fullscreenPreviewRef = useRef<HTMLDivElement | null>(null)
  const [copied, setCopied] = useState<'js' | 'json' | null>(null)
  const [sourceImageUrl, setSourceImageUrl] = useState<string | undefined>()
  const [alternateSourceImageUrl, setAlternateSourceImageUrl] = useState<
    string | undefined
  >()

  const jsonOutput = useMemo(() => JSON.stringify(config, null, 2), [config])
  const jsOutput = useMemo(
    () => `const r0ParticleLogoConfig = ${jsonOutput}`,
    [jsonOutput]
  )

  const setNumber = (key: SliderControl['key'], value: number) => {
    setConfig((current) => ({ ...current, [key]: value }))
  }

  const copy = async (kind: 'js' | 'json') => {
    const text = kind === 'js' ? jsOutput : jsonOutput
    await navigator.clipboard?.writeText(text)
    setCopied(kind)
    window.setTimeout(() => setCopied(null), 1200)
  }

  const reset = () => {
    setConfig(defaultR0ParticleLogoConfig)
  }

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement === fullscreenPreviewRef.current
      )
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const togglePreviewFullscreen = async () => {
    const el = fullscreenPreviewRef.current
    if (!el) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await el.requestFullscreen()
      }
    } catch {
      // Unsupported or denied
    }
  }

  const onSourceChange = (
    event: ChangeEvent<HTMLInputElement>,
    target: 'primary' | 'alternate'
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (target === 'primary') {
          setSourceImageUrl(reader.result)
        } else {
          setAlternateSourceImageUrl(reader.result)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <main className="min-h-dvh bg-[#fafafa] text-neutral-900 lg:h-dvh lg:overflow-hidden">
      <div className="grid min-h-dvh grid-cols-1 lg:h-dvh lg:min-h-0 lg:grid-cols-[minmax(17.5rem,26%)_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-neutral-300/80 border-r border-dashed bg-[#fafafa] lg:h-dvh lg:overflow-hidden">
          <header className="shrink-0 border-neutral-300/80 border-b border-dashed px-4 py-4 lg:px-5">
            <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-[0.12em]">
              Lab
            </p>
            <h1 className="mt-1 font-semibold text-base text-neutral-900 leading-tight">
              Canvas dithering
            </h1>
            <p className="mt-2 text-[11px] text-neutral-500 leading-relaxed">
              Stippled R0 logo: halftone + motion. Adjust left, preview right.
            </p>
          </header>

          <div
            className="min-h-0 flex-1 space-y-8 overflow-y-auto overscroll-y-contain px-4 py-6 [-webkit-overflow-scrolling:touch] lg:px-5"
            data-lenis-prevent
          >
            <SidebarSection
              description="Upload optional bitmaps. Default uses vector R0 paths."
              title="1 · Sources"
            >
              <div className="space-y-3 rounded-lg border border-neutral-300/80 border-dashed bg-white p-3">
                <label className="flex min-h-16 cursor-pointer items-center justify-center rounded-md border border-neutral-300/80 border-dashed bg-neutral-50/80 px-3 text-center text-[11px] text-neutral-600 transition hover:border-neutral-400 hover:bg-white">
                  <input
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => onSourceChange(event, 'primary')}
                    type="file"
                  />
                  {sourceImageUrl
                    ? 'Source A loaded: upload another'
                    : 'Source A: default R0'}
                </label>
                <label className="flex min-h-16 cursor-pointer items-center justify-center rounded-md border border-neutral-300/80 border-dashed bg-neutral-50/80 px-3 text-center text-[11px] text-neutral-600 transition hover:border-neutral-400 hover:bg-white">
                  <input
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => onSourceChange(event, 'alternate')}
                    type="file"
                  />
                  {alternateSourceImageUrl
                    ? 'Source B loaded: upload another'
                    : 'Source B: upload conversion target'}
                </label>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Click builds swap progress; release triggers a shockwave. When
                  progress reaches 100%, the source swaps.
                </p>
                {sourceImageUrl ? (
                  <button
                    className="mt-2 font-medium text-[11px] text-neutral-500 underline decoration-neutral-300 decoration-dashed underline-offset-2 transition hover:text-neutral-800"
                    onClick={() => setSourceImageUrl(undefined)}
                    type="button"
                  >
                    Use default R0 source
                  </button>
                ) : null}
                {alternateSourceImageUrl ? (
                  <button
                    className="block font-medium text-[11px] text-neutral-500 underline decoration-neutral-300 decoration-dashed underline-offset-2 transition hover:text-neutral-800"
                    onClick={() => setAlternateSourceImageUrl(undefined)}
                    type="button"
                  >
                    Clear Source B
                  </button>
                ) : null}
              </div>
            </SidebarSection>

            <SidebarSection
              description="Layout, distortion, geometry, and dot colours."
              title="2 · Appearance"
            >
              <ControlGroup title="Layout & tone">
                {mainControls.map((control) => (
                  <Slider
                    control={control}
                    key={control.key}
                    onChange={setNumber}
                    value={config[control.key]}
                  />
                ))}
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Tone curve runs before dithering. Blur softens noise for
                  ordered halftone.
                </p>
              </ControlGroup>

              <ControlGroup title="Mask shape">
                {shapeControls.map((control) => (
                  <Slider
                    control={control}
                    key={control.key}
                    onChange={setNumber}
                    value={config[control.key]}
                  />
                ))}
              </ControlGroup>

              <ControlGroup title="Colours">
                <label className="flex items-center justify-between gap-3 text-[11px] text-neutral-600">
                  <span>Source A</span>
                  <input
                    className="h-8 w-12 cursor-pointer rounded border border-neutral-300/80 border-dashed bg-white"
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        color: hexToColor(event.target.value),
                      }))
                    }
                    type="color"
                    value={colorToHex(config.color)}
                  />
                </label>
                <label className="flex items-center justify-between gap-3 text-[11px] text-neutral-600">
                  <span>Source B</span>
                  <input
                    className="h-8 w-12 cursor-pointer rounded border border-neutral-300/80 border-dashed bg-white"
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        alternateColor: hexToColor(event.target.value),
                      }))
                    }
                    type="color"
                    value={colorToHex(config.alternateColor)}
                  />
                </label>
                <Slider
                  control={{
                    key: 'dotScale',
                    label: 'Dot scale (vs cell)',
                    min: 0.35,
                    max: 1.35,
                    step: 0.01,
                  }}
                  onChange={setNumber}
                  value={config.dotScale}
                />
              </ControlGroup>
            </SidebarSection>

            <SidebarSection
              description="How ink is turned into on/off dots."
              title="3 · Halftone"
            >
              <ControlGroup title="Algorithm & mode">
                {algorithmControls.map((control) => (
                  <Slider
                    control={control}
                    key={control.key}
                    onChange={setNumber}
                    value={config[control.key]}
                  />
                ))}
                <label className="flex flex-col gap-2 text-[11px] text-neutral-600">
                  <span>Dither mode</span>
                  <select
                    className="rounded-md border border-neutral-300/80 border-dashed bg-neutral-50/50 px-2 py-2 font-mono text-neutral-800 text-xs outline-none transition focus:border-neutral-400 focus:bg-white"
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        ditherMode: event.target.value as
                          | 'bayer8'
                          | 'floydSteinberg',
                      }))
                    }
                    value={config.ditherMode}
                  >
                    <option value="bayer8">Bayer 8×8 (ordered halftone)</option>
                    <option value="floydSteinberg">
                      Floyd–Steinberg (error diffusion)
                    </option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-neutral-800 text-xs">
                  <input
                    checked={config.invert}
                    className="size-4 accent-neutral-900"
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        invert: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  Outline only (hollow)
                </label>
                <label className="flex items-center gap-2 text-neutral-800 text-xs">
                  <input
                    checked={config.negateLuminance}
                    className="size-4 accent-neutral-900"
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        negateLuminance: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  Negate luminance
                </label>
              </ControlGroup>

              <ControlGroup
                hint={`Strength now ${Math.round(config.errorStrength * 100)}% of standard diffusion`}
                title="Error diffusion"
              >
                {errorControls.map((control) => (
                  <Slider
                    control={control}
                    key={control.key}
                    onChange={setNumber}
                    value={config[control.key]}
                  />
                ))}
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  0% disables diffusion; 100% is standard Floyd–Steinberg; above
                  100% exaggerates grain.
                </p>
                <label className="flex items-center gap-2 text-neutral-800 text-xs">
                  <input
                    checked={config.serpentine}
                    className="size-4 accent-neutral-900"
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        serpentine: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  Serpentine scanning
                </label>
              </ControlGroup>
            </SidebarSection>

            <SidebarSection
              description="Resolution for preview and screen capture."
              title="4 · Sharpness"
            >
              <ControlGroup title="Canvas & grid">
                {recordingControls.map((control) => (
                  <Slider
                    control={control}
                    key={control.key}
                    onChange={setNumber}
                    value={config[control.key]}
                  />
                ))}
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Higher DPR and stipple grid improve crispness; both use more
                  CPU.
                </p>
              </ControlGroup>
            </SidebarSection>

            <SidebarSection
              description="Mouse repel, pointer-up rings, and A/B swap pacing."
              title="5 · Motion"
            >
              <ControlGroup hint="Uses mouse pointer only." title="Pointer">
                {pointerInteractionControls.map((control) => (
                  <Slider
                    control={control}
                    key={control.key}
                    onChange={setNumber}
                    value={config[control.key]}
                  />
                ))}
              </ControlGroup>

              <ControlGroup hint="Fires on pointer up." title="Shockwave">
                {shockwaveControls.map((control) => (
                  <Slider
                    control={control}
                    key={control.key}
                    onChange={setNumber}
                    value={config[control.key]}
                  />
                ))}
              </ControlGroup>

              <ControlGroup title="Source swap">
                {swapControls.map((control) => (
                  <Slider
                    control={control}
                    key={control.key}
                    onChange={setNumber}
                    value={config[control.key]}
                  />
                ))}
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Rapid clicks charge an explosion; particles return as the
                  other source when swap completes.
                </p>
              </ControlGroup>
            </SidebarSection>

            <SidebarSection
              description="Copy for your app or reset everything."
              title="6 · Export"
            >
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="rounded-md border border-neutral-900 border-dashed bg-neutral-900 px-3 py-2 font-medium text-white text-xs transition hover:bg-neutral-800"
                  onClick={() => copy('json')}
                  type="button"
                >
                  {copied === 'json' ? 'Copied JSON' : 'Copy JSON'}
                </button>
                <button
                  className="rounded-md border border-neutral-900 border-dashed bg-neutral-900 px-3 py-2 font-medium text-white text-xs transition hover:bg-neutral-800"
                  onClick={() => copy('js')}
                  type="button"
                >
                  {copied === 'js' ? 'Copied JS' : 'Copy JS'}
                </button>
                <button
                  className="col-span-2 rounded-md border border-neutral-300/80 border-dashed bg-white px-3 py-2 font-medium text-neutral-800 text-xs transition hover:border-neutral-400 hover:bg-neutral-50"
                  onClick={reset}
                  type="button"
                >
                  Reset defaults
                </button>
              </div>
            </SidebarSection>
          </div>
        </aside>

        <section
          className="relative flex min-h-dvh flex-col overflow-y-auto overscroll-y-contain bg-neutral-50 lg:h-dvh lg:min-h-0"
          data-lenis-prevent
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_20%,#fff_0%,transparent_55%)]"
          />
          <div className="relative flex w-full min-w-0 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10 lg:pb-12 xl:px-14">
            <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-neutral-300/80 border-b border-dashed pb-5">
              <div>
                <p className="font-medium text-[10px] text-neutral-400 tracking-wide">
                  Preview
                </p>
                <h2 className="mt-0.5 font-semibold text-lg text-neutral-900 tracking-tight">
                  Stippled mark
                </h2>
                <p className="mt-1.5 max-w-prose text-[11px] text-neutral-500 leading-relaxed">
                  Fluid ~850∶650 frame. Fullscreen hides chrome for recording.
                </p>
              </div>
              <button
                className="shrink-0 rounded-md border border-neutral-300/80 border-dashed bg-white px-4 py-2 font-medium text-neutral-800 text-xs transition hover:border-neutral-400 hover:bg-neutral-50"
                onClick={() => void togglePreviewFullscreen()}
                type="button"
              >
                {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </button>
            </header>

            <div className="flex w-full min-w-0 flex-col gap-12">
              <div className="flex w-full shrink-0 flex-col">
                <div
                  className={cn(
                    'relative flex min-h-0 w-full items-center justify-center border-2 border-neutral-300/80 border-dashed bg-[#fafafa]',
                    isFullscreen
                      ? 'min-h-dvh w-full rounded-none border-0'
                      : 'aspect-[850/650] max-h-[min(88dvh,960px)] w-full'
                  )}
                  ref={fullscreenPreviewRef}
                >
                  {!isFullscreen ? (
                    <div className="absolute bottom-4 left-4 z-10 flex items-stretch gap-0 border border-neutral-300/80 border-dashed bg-neutral-50/90">
                      <span className="flex items-center border-neutral-300/80 border-r border-dashed bg-white px-2 font-mono text-[9px] text-neutral-400 uppercase tracking-wide">
                        Ref
                      </span>
                      <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center bg-white">
                        <R0ParticleLogo
                          alternateSourceImageUrl={alternateSourceImageUrl}
                          className="w-[3.25rem]"
                          config={config}
                          href="/lab/dithering-editor"
                          sourceImageUrl={sourceImageUrl}
                        />
                      </div>
                    </div>
                  ) : null}
                  {isFullscreen ? (
                    <>
                      <p className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[10px] text-neutral-400 uppercase tracking-wide">
                        Esc to exit
                      </p>
                      <button
                        className="absolute top-3 right-3 z-10 rounded-md border border-neutral-300/80 border-dashed bg-white/95 px-3 py-1.5 font-medium text-neutral-800 text-xs transition hover:bg-neutral-50"
                        onClick={() => void document.exitFullscreen()}
                        type="button"
                      >
                        Exit
                      </button>
                    </>
                  ) : null}
                  <R0ParticleLogo
                    alternateSourceImageUrl={alternateSourceImageUrl}
                    className={cn(
                      isFullscreen
                        ? 'w-[min(92%,min(72rem,min(85vw,72dvh)))]'
                        : 'w-[min(94%,min(56rem,min(92vw,58dvh)))]'
                    )}
                    config={config}
                    href="/lab/dithering-editor"
                    sourceImageUrl={sourceImageUrl}
                  />
                </div>
              </div>

              <section className="shrink-0 border border-neutral-300/80 border-dashed bg-white">
                <header className="flex items-center justify-between gap-3 border-neutral-200 border-b border-dashed px-4 py-3">
                  <div>
                    <p className="font-medium text-[10px] text-neutral-400 tracking-wide">
                      Export
                    </p>
                    <h3 className="font-semibold text-neutral-900 text-sm">
                      Config JSON
                    </h3>
                  </div>
                  <button
                    className="rounded-md border border-neutral-300/80 border-dashed bg-white px-3 py-1.5 font-medium text-neutral-800 text-xs transition hover:border-neutral-400 hover:bg-neutral-50"
                    onClick={() => copy('json')}
                    type="button"
                  >
                    Copy
                  </button>
                </header>
                <pre
                  className="max-h-48 min-h-0 overflow-y-auto overscroll-y-contain border-neutral-200 border-t border-dashed bg-neutral-50/50 px-4 py-3 font-mono text-[11px] text-neutral-600 leading-relaxed [-webkit-overflow-scrolling:touch]"
                  data-lenis-prevent
                >
                  {jsonOutput}
                </pre>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
