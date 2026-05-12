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
}

export function TimelineAudioPlayer({

  uploadedFile,

  currentTime,
  setCurrentTime,

  isPlaying,
  setIsPlaying

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
  useEffect(() => {

    if (
      !uploadedFile
    ) return;

    const url =
      URL.createObjectURL(
        uploadedFile
      );

    const audio =
      new Audio(url);

    audioRef.current = audio;

    audio.addEventListener(
      "loadedmetadata",
      () => {
        setDuration(
          audio.duration
        );
      }
    );

    audio.addEventListener(
      "timeupdate",
      () => {

        setCurrentTime(
          audio.currentTime
        );
      }
    );

    return () => {
      audio.pause();
    };

  }, [uploadedFile]);

  // ─────────────────────────────
  // PLAY / PAUSE
  // ─────────────────────────────
  const togglePlayback =
    () => {

      if (
        !audioRef.current
      ) return;

      if (isPlaying) {

        audioRef.current.pause();

        setIsPlaying(false);

      } else {

        audioRef.current.play();

        setIsPlaying(true);
      }
    };

  // ─────────────────────────────
  // SEEK
  // ─────────────────────────────
  const seek = (
    time: number
  ) => {

    if (
      !audioRef.current
    ) return;

    audioRef.current.currentTime =
      time;

    setCurrentTime(time);
  };

  return (

    <div
      className="
        mt-6
        rounded-xl
        border border-zinc-700
        bg-zinc-900
        p-4
        space-y-4
      "
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

          className="
            rounded-lg
            bg-green-500
            hover:bg-green-400
            text-black
            p-2
            transition-all
          "
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

      </div>

      {/* TIMELINE */}
      <input
        type="range"

        min={0}

        max={duration || 1}

        step={0.01}

        value={currentTime}

        onChange={(e) =>
          seek(
            Number(
              e.target.value
            )
          )
        }

        className="w-full"
      />

    </div>
  );
}