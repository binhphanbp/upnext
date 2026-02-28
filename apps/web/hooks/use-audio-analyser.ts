/**
 * use-audio-analyser.ts
 *
 * Analyses a MediaStream's audio track in real time using the Web Audio API.
 * Returns a normalised volume level (0–1) and an array of frequency band values
 * suitable for driving a waveform visualisation.
 */
'use client'

import { useEffect, useRef, useState } from 'react'

const FFT_SIZE = 64 // must be a power of 2; gives 32 frequency bins
const NUM_BARS = 12  // how many bars we expose for the waveform component

export interface UseAudioAnalyserReturn {
  /** 0–1 normalised RMS volume */
  volume: number
  /** Array of NUM_BARS values (0–1) representing frequency bands */
  bars: number[]
}

export function useAudioAnalyser(
  stream: MediaStream | null,
  active = true,
): UseAudioAnalyserReturn {
  const [volume, setVolume] = useState(0)
  const [bars, setBars] = useState<number[]>(Array(NUM_BARS).fill(0))

  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const rafRef = useRef<number>(0)
  const dataRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(new ArrayBuffer(FFT_SIZE / 2)))

  useEffect(() => {
    if (!stream || !active) {
      setVolume(0)
      setBars(Array(NUM_BARS).fill(0))
      return
    }

    /* Build audio graph */
    const ctx = new AudioContext()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = FFT_SIZE
    analyser.smoothingTimeConstant = 0.6

    const source = ctx.createMediaStreamSource(stream)
    source.connect(analyser)

    audioCtxRef.current = ctx
    analyserRef.current = analyser
    sourceRef.current = source
    dataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount))

    /* Animation loop */
    function tick() {
      analyser.getByteFrequencyData(dataRef.current)

      /* Normalised RMS volume */
      const arr = Array.from(dataRef.current)
      const sumSq = arr.reduce((acc, v) => acc + v * v, 0)
      const rms = Math.sqrt(sumSq / arr.length) / 255
      setVolume(rms)

      /* Downsample frequency bins → NUM_BARS buckets */
      const binCount = arr.length
      const step = Math.floor(binCount / NUM_BARS)
      const nextBars = Array.from({ length: NUM_BARS }, (_, i) => {
        let sum = 0
        for (let j = 0; j < step; j++) {
          sum += arr[i * step + j] ?? 0
        }
        return (sum / step) / 255
      })
      setBars(nextBars)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      source.disconnect()
      void ctx.close()
    }
  }, [stream, active])

  return { volume, bars }
}
