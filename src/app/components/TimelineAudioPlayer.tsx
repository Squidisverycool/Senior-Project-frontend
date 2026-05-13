import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Play,
  Pause
} from "lucide-react";

interface Props {

  uploadedFile?: File | null;

  currentTime: number;

  setCurrentTime: (
    t: number
  ) => void;

  isPlaying: boolean;

  setIsPlaying: (
    b: boolean
  ) => void;

  disabled?: boolean;
}

export function TimelineAudioPlayer({

  uploadedFile,

  currentTime,
  setCurrentTime,

  isPlaying,
  setIsPlaying,

  disabled = false

}: Props) {

  const audioRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const [duration, setDuration] =
    useState(0);

  // ─────────────────────────────
  // LOAD AUDIO
  // ─────────────────────────────
 // ─────────────────────────────
// LOAD AUDIO
// ─────────────────────────────
useEffect(() => {

  // destroy previous audio completely
  if (audioRef.current) {

    audioRef.current.pause();

    audioRef.current.src = "";

    audioRef.current = null;
  }

  if (!uploadedFile) return;

  const url =
    URL.createObjectURL(
      uploadedFile
    );

  const audio =
    new Audio(url);

  audioRef.current = audio;

  const handleLoadedMetadata =
    () => {

      setDuration(
        audio.duration
      );
    };

  const handleTimeUpdate =
    () => {

      setCurrentTime(
        audio.currentTime
      );
    };

  const handleEnded =
    () => {

      setIsPlaying(false);

      setCurrentTime(0);
    };

  audio.addEventListener(
    "loadedmetadata",
    handleLoadedMetadata
  );

  audio.addEventListener(
    "timeupdate",
    handleTimeUpdate
  );

  audio.addEventListener(
    "ended",
    handleEnded
  );

  return () => {

    audio.pause();

    audio.removeEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    audio.removeEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    audio.removeEventListener(
      "ended",
      handleEnded
    );

    audio.src = "";

    URL.revokeObjectURL(url);
  };

}, [uploadedFile]);

  // ─────────────────────────────
  // SYNC PLAYBACK STATE
  // ─────────────────────────────
 // ─────────────────────────────
// SYNC PLAYBACK STATE
// ─────────────────────────────
useEffect(() => {

  const audio =
    audioRef.current;

  if (!audio) return;

  if (isPlaying) {

    // prevent duplicate play calls
    if (audio.paused) {

      audio.play();
    }

  } else {

    audio.pause();
  }

}, [isPlaying]);
  // ─────────────────────────────
// RESET AUDIO WHEN TIME = 0
// ─────────────────────────────
useEffect(() => {

  if (
    !audioRef.current
  ) return;

  // only hard sync when rewinding
 if (
  currentTime === 0 &&
  audioRef.current.currentTime !== 0
) {

  audioRef.current.pause();

  audioRef.current.currentTime = 0;
}

}, [currentTime]);

  // ─────────────────────────────
  // PLAY / PAUSE
  // ─────────────────────────────
  const togglePlayback =
    () => {

      if (
        disabled
      ) return;

      if (
        !audioRef.current
      ) return;

      setIsPlaying(
        !isPlaying
      );
    };

  // ─────────────────────────────
  // SEEK
  // ─────────────────────────────
  const seek = (
    time: number
  ) => {

    if (
      disabled
    ) return;

    if (
      !audioRef.current
    ) return;

    audioRef.current.currentTime =
      time;

    setCurrentTime(time);
  };

  return (

    <div
      className={`
        mt-6
        rounded-xl
        border border-zinc-700
        bg-zinc-900
        p-4
        space-y-4
        transition-opacity
        ${
          disabled
            ? "opacity-75"
            : ""
        }
      `}
    >

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <button
          onClick={
            togglePlayback
          }

          disabled={disabled}

          className={`
            rounded-lg
            p-2
            transition-all
            ${
              disabled
                ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-400 text-black"
            }
          `}
        >

          {isPlaying
            ? (
              <Pause className="size-5" />
            )
            : (
              <Play className="size-5" />
            )
          }

        </button>

        <div
          className="
            text-sm
            text-zinc-300
            font-mono
          "
        >
          {currentTime.toFixed(2)}s
        </div>

        {disabled && (
          <div
            className="
              text-xs
              text-yellow-400
              font-medium
            "
          >
            Locked during recording
          </div>
        )}

      </div>

      {/* TIMELINE */}
      <input
        type="range"

        min={0}

        max={duration || 1}

        step={0.01}

        value={currentTime}

        disabled={disabled}

        onChange={(e) =>
          seek(
            Number(
              e.target.value
            )
          )
        }

        className={`
          w-full
          ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : ""
          }
        `}
      />

    </div>
  );
}