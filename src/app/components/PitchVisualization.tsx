import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { Note } from "@/app/components/NoteTableEditor";

import {
  useState,
  useRef,
  useMemo,
  useEffect,
} from "react";

import {
  BarChart2,
  Music2,
} from "lucide-react";

interface Props {

  notes?: Note[];

  isRecording: boolean;

  currentTime: number;

  setCurrentTime: (
    t: number
  ) => void;

  isPlaying: boolean;

  curveMode?: "discrete" | "curved";

  showReliable?: boolean;

  showUncertain?: boolean;

  showUnstable?: boolean;
}

const NOTE_TO_VALUE: Record<string, number> = {

  silence: 0,

  // C2 → B2
  C2: -12,
  "C#2": -11,
  D2: -10,
  "D#2": -9,
  E2: -8,
  F2: -7,
  "F#2": -6,
  G2: -5,
  "G#2": -4,
  A2: -3,
  "A#2": -2,
  B2: -1,

  // C3 → B3
  C3: 0,
  "C#3": 1,
  D3: 2,
  "D#3": 3,
  E3: 4,
  F3: 5,
  "F#3": 6,
  G3: 7,
  "G#3": 8,
  A3: 9,
  "A#3": 10,
  B3: 11,

  // C4 → B4
  C4: 12,
  "C#4": 13,
  D4: 14,
  "D#4": 15,
  E4: 16,
  F4: 17,
  "F#4": 18,
  G4: 19,
  "G#4": 20,
  A4: 21,
  "A#4": 22,
  B4: 23,

  // C5 → B5
  C5: 24,
  "C#5": 25,
  D5: 26,
  "D#5": 27,
  E5: 28,
  F5: 29,
  "F#5": 30,
  G5: 31,
  "G#5": 32,
  A5: 33,
  "A#5": 34,
  B5: 35,
};
type Mode =
  | "analytic"
  | "musical";

export function PitchVisualization({

  notes = [],

  isRecording,

  currentTime,
  setCurrentTime,

  isPlaying,

  showReliable = true,
  showUncertain = true,
  showUnstable = true,

}: Props) {

  const containerRef =
    useRef<HTMLDivElement>(null);

  const [mode, setMode] =
    useState<Mode>("musical");

  // ─────────────────────────────
  // LIVE PITCH
  // ─────────────────────────────
  const [livePitch, setLivePitch] =
    useState<
      { time: number; pitch: number }[]
    >([]);

  const [liveTime, setLiveTime] =
    useState(0);

  const audioContextRef =
    useRef<AudioContext | null>(null);

  const analyserRef =
    useRef<AnalyserNode | null>(null);

  const sourceRef =
    useRef<MediaStreamAudioSourceNode | null>(null);

  const animationRef =
    useRef<number | null>(null);

  const startTimeRef =
    useRef<number>(0);

  // ─────────────────────────────
  // TRUE FILTERING
  // ─────────────────────────────
  const filteredNotes = useMemo(() => {

    return notes.filter((note) => {

      // DISABLED
      if (note.disabled) {
        return false;
      }

      const r =
        note.reliability ?? 1;

      // RELIABLE
      if (
        r > 0.8 &&
        !showReliable
      ) {
        return false;
      }

      // UNCERTAIN
      if (
        r > 0.6 &&
        r <= 0.8 &&
        !showUncertain
      ) {
        return false;
      }

      // UNSTABLE
      if (
        r <= 0.6 &&
        !showUnstable
      ) {
        return false;
      }

      return true;
    });

  }, [
    notes,
    showReliable,
    showUncertain,
    showUnstable
  ]);

  // ─────────────────────────────
  // REFERENCE CURVE
  // ─────────────────────────────
  const pitchCurve = useMemo(() => {

    if (!filteredNotes.length)
      return [];

    const pts: {
      time: number;
      pitch: number;
      reliability: number;
      color: string;
    }[] = [];

    if (mode === "analytic") {

      const step = 0.05;

      for (
        let i = 0;
        i < filteredNotes.length;
        i++
      ) {

        const note =
          filteredNotes[i];

     const pitch =
  NOTE_TO_VALUE[
    note.note_name?.trim()
  ] ?? 0;

        const start =
          note.start;

        const end =
          note.end;

        const reliability =
          note.reliability ?? 1;

        let color =
          "#22c55e";

        if (reliability <= 0.6) {
          color = "#ef4444";
        }
        else if (
          reliability <= 0.8
        ) {
          color = "#eab308";
        }

        for (
          let t = start;
          t <= end;
          t += step
        ) {

          pts.push({
            time: t,
            pitch,
            reliability,
            color,
          });
        }
      }
    }

    else {

      for (
        let i = 0;
        i < filteredNotes.length;
        i++
      ) {

        const note =
          filteredNotes[i];

      const pitch =
  NOTE_TO_VALUE[
    note.note_name?.trim()
  ] ?? 0;

        const center =
          (
            note.start
            +
            note.end
          ) / 2;

        const reliability =
          note.reliability ?? 1;

        let color =
          "#22c55e";

        if (reliability <= 0.6) {
          color = "#ef4444";
        }
        else if (
          reliability <= 0.8
        ) {
          color = "#eab308";
        }

        pts.push({
          time: center,
          pitch,
          reliability,
          color,
        });
      }
    }

    return pts;

  }, [
    filteredNotes,
    mode
  ]);

  // ─────────────────────────────
// LIVE MIC PITCH DETECTION
// ─────────────────────────────
useEffect(() => {

  // RESET
  if (!isRecording) {

    if (animationRef.current) {
      cancelAnimationFrame(
        animationRef.current
      );
    }

    setLivePitch([]);
    setLiveTime(0);

    return;
  }

  let mounted = true;

  // ─────────────────────────────
  // START GLOBAL TIMER
  // ─────────────────────────────
  const recordingStart =
    performance.now();

  const updateTimeline = () => {

    if (!mounted) return;

    const elapsed =
      (
        performance.now()
        -
        recordingStart
      ) / 1000;

    // ALWAYS MOVE
    setLiveTime(elapsed);

    animationRef.current =
      requestAnimationFrame(
        updateTimeline
      );
  };

  updateTimeline();

  // ─────────────────────────────
  // START MIC
  // ─────────────────────────────
  const startMic = async () => {

    const stream =
      await navigator
        .mediaDevices
        .getUserMedia({
          audio: true
        });

    const audioContext =
      new AudioContext();

    const analyser =
      audioContext.createAnalyser();

    analyser.fftSize = 2048;

    const source =
      audioContext.createMediaStreamSource(
        stream
      );

    source.connect(analyser);

    audioContextRef.current =
      audioContext;

    analyserRef.current =
      analyser;

    sourceRef.current =
      source;

    const buffer =
      new Float32Array(
        analyser.fftSize
      );

    // ─────────────────────────────
    // PITCH LOOP
    // ─────────────────────────────
    const detectPitch = () => {

      if (!mounted) return;

      analyser.getFloatTimeDomainData(
        buffer
      );

      const pitch =
  autoCorrelate(
    buffer,
    audioContext.sampleRate
  );

// CURRENT TIME
const elapsed =
  (
    performance.now()
    -
    recordingStart
  ) / 1000;

// VOICE OR SILENCE
const normalizedPitch =
  pitch !== -1
    ? hzToMidi(pitch) - 48
    : 0;

// ALWAYS PUSH POINTS
setLivePitch((prev) => {

  const next = [
    ...prev,
    {
      time: elapsed,
      pitch: normalizedPitch,
    }
  ];

  return next.slice(-500);
});

      requestAnimationFrame(
        detectPitch
      );
    };

    detectPitch();
  };

  startMic();

  return () => {

    mounted = false;

    if (animationRef.current) {
      cancelAnimationFrame(
        animationRef.current
      );
    }

    audioContextRef.current?.close();
  };

}, [isRecording]);

  // ─────────────────────────────
  // MAX TIME
  // ─────────────────────────────
  const maxTime = useMemo(() => {

    return filteredNotes.length
      ? Math.max(
          ...filteredNotes.map(
            (n) => n.end
          )
        )
      : 10;

  }, [filteredNotes]);

  // ─────────────────────────────
  // SCROLL
  // ─────────────────────────────
  const VIEW_SIZE = 8;


const activeTime =
  isRecording
    ? liveTime
    : currentTime;

const liveWindowStart =
  Math.max(
    0,
    activeTime - 2
  );

  const domain: [number, number] = [
    liveWindowStart,
    liveWindowStart + VIEW_SIZE
  ];

  // ─────────────────────────────
  // WHEEL SCROLL
  // ─────────────────────────────
  useEffect(() => {

    if (isRecording)
      return;

    const element =
      containerRef.current;

    if (!element) return;

    const wheelHandler = (
      e: WheelEvent
    ) => {

      e.preventDefault();

      setCurrentTime((prev) => {

        const delta =
          e.deltaY > 0
            ? 0.5
            : -0.5;

        let next =
          prev + delta;

        next = Math.max(
          0,
          Math.min(
            next,
            Math.max(
              0,
              maxTime - VIEW_SIZE
            )
          )
        );

        return next;
      });
    };

    element.addEventListener(
      "wheel",
      wheelHandler,
      { passive: false }
    );

    return () =>
      element.removeEventListener(
        "wheel",
        wheelHandler
      );

  }, [maxTime, isRecording]);

  // ─────────────────────────────
  // COMBINED DATA
  // ─────────────────────────────
  const combinedData = [
    ...pitchCurve.map((p) => ({
      ...p,
      livePitch: null,
    })),

    ...livePitch.map((p) => ({
      time: p.time,
      pitch: null,
      livePitch: p.pitch,
    })),
  ];

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div
      ref={containerRef}

      className="
        h-[450px]
        rounded-xl
        border border-zinc-700
        bg-zinc-900
        p-4
        relative
      "
    >

      {/* CHART */}
      <div className="h-[360px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <LineChart data={combinedData}>

            <CartesianGrid
              strokeDasharray="3 3"
            />

            {/* PLAYHEAD */}
            <ReferenceLine
              x={
                liveWindowStart + 2
              }

              stroke="#ffffff"

              strokeDasharray="5 5"
            />

            <XAxis
              dataKey="time"
              type="number"
              domain={domain}
              allowDataOverflow
              scale="linear"
            />

            <YAxis />

            <Tooltip />

            {/* REFERENCE */}
            <Line
              type={
                mode === "analytic"
                  ? "linear"
                  : "monotone"
              }

              dataKey="pitch"

              stroke="#22c55e"

              strokeWidth={3}

              dot={false}

              isAnimationActive={false}
            />

            {/* LIVE MIC */}
            <Line
              type="monotone"

              dataKey="livePitch"

              stroke="#3b82f6"

              strokeWidth={2}

              dot={false}

              isAnimationActive={false}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      {/* SCROLLBAR */}
      <div className="mt-4">

        <input
          type="range"

          disabled={isRecording}

          min={0}

          max={
            Math.max(
              0,
              maxTime - VIEW_SIZE
            )
          }

          step={0.05}

          value={currentTime}

          onChange={(e) =>
            setCurrentTime(
              Number(
                e.target.value
              )
            )
          }

          className="w-full"
        />

      </div>

      {/* TOOLBAR */}
      <div className="
        absolute
        top-3
        right-5
        flex
        items-center
        gap-2
      ">

        <button
          onClick={() =>
            setMode((prev) =>
              prev === "analytic"
                ? "musical"
                : "analytic"
            )
          }

          className={`
            flex
            items-center
            gap-1.5
            px-3 py-1.5
            rounded-lg
            text-xs
            font-medium
            transition-all
            shadow-lg
            ${
              mode === "musical"
                ? "bg-green-500 text-black"
                : "bg-zinc-800/90 text-white hover:bg-zinc-700"
            }
          `}
        >

          {
            mode === "musical"
              ? (
                <Music2 className="size-3" />
              )
              : (
                <BarChart2 className="size-3" />
              )
          }

          {
            mode === "musical"
              ? "Musical"
              : "Analytic"
          }

        </button>

      </div>

    </div>
  );
}

// ─────────────────────────────
// PITCH DETECTION
// ─────────────────────────────
function autoCorrelate(
  buffer: Float32Array,
  sampleRate: number
) {

  let SIZE = buffer.length;

  let rms = 0;

  for (
    let i = 0;
    i < SIZE;
    i++
  ) {
    rms += buffer[i] * buffer[i];
  }

  rms = Math.sqrt(rms / SIZE);

  if (rms < 0.01)
    return -1;

  let r1 = 0;
  let r2 = SIZE - 1;

  const threshold = 0.2;

  for (
    let i = 0;
    i < SIZE / 2;
    i++
  ) {
    if (
      Math.abs(buffer[i])
      < threshold
    ) {
      r1 = i;
      break;
    }
  }

  for (
    let i = 1;
    i < SIZE / 2;
    i++
  ) {
    if (
      Math.abs(
        buffer[SIZE - i]
      ) < threshold
    ) {
      r2 = SIZE - i;
      break;
    }
  }

  buffer = buffer.slice(r1, r2);

  SIZE = buffer.length;

  const c =
    new Array(SIZE).fill(0);

  for (
    let i = 0;
    i < SIZE;
    i++
  ) {
    for (
      let j = 0;
      j < SIZE - i;
      j++
    ) {
      c[i] +=
        buffer[j]
        *
        buffer[j + i];
    }
  }

  let d = 0;

  while (
    c[d] > c[d + 1]
  ) {
    d++;
  }

  let maxval = -1;
  let maxpos = -1;

  for (
    let i = d;
    i < SIZE;
    i++
  ) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  const T0 = maxpos;

  return sampleRate / T0;
}

function hzToMidi(hz: number) {
  return (
    69
    +
    12
    *
    Math.log2(hz / 440)
  );
}