import {
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

import {
  useEffect,
  useRef,
} from "react";

interface Props {

  uploadedFile:
    File | null;

  currentTime:
    number;

  setCurrentTime:
    (
      time: number
    ) => void;

  isPlaying:
    boolean;

  setIsPlaying:
    (
      playing: boolean
    ) => void;
}

export function TimelineAudioPlayer({

  uploadedFile,

  currentTime,
  setCurrentTime,

  isPlaying,
  setIsPlaying,

}: Props) {

  const audioRef =
    useRef<HTMLAudioElement>(null);

  // ─────────────────────────────
  // LOAD FILE
  // ─────────────────────────────
  useEffect(() => {

    if (
      uploadedFile &&
      audioRef.current
    ) {

      const url =
        URL.createObjectURL(
          uploadedFile
        );

      audioRef.current.src = url;

      return () => {
        URL.revokeObjectURL(url);
      };
    }

  }, [uploadedFile]);

  // ─────────────────────────────
  // PLAY / PAUSE SYNC
  // ─────────────────────────────
  useEffect(() => {

    const audio =
      audioRef.current;

    if (!audio) return;

    // FORCE RESET IF TIME RESET
    if (currentTime === 0) {

      audio.pause();

      audio.currentTime = 0;
    }

    if (isPlaying) {

      audio.currentTime =
        currentTime;

      audio.play();

    } else {

      audio.pause();
    }

  }, [isPlaying]);

  // ─────────────────────────────
  // TIMELINE SYNC
  // ─────────────────────────────
  useEffect(() => {

    const audio =
      audioRef.current;

    if (!audio) return;

    const delta =
      Math.abs(
        audio.currentTime
        - currentTime
      );

    // PREVENT CONSTANT SEEKING
    if (delta > 0.15) {

      audio.currentTime =
        currentTime;
    }

  }, [currentTime]);

  // ─────────────────────────────
  // AUDIO EVENTS
  // ─────────────────────────────
  useEffect(() => {

    const audio =
      audioRef.current;

    if (!audio) return;

    const updateTime = () => {

      setCurrentTime(
        audio.currentTime
      );
    };

    const onEnded = () => {

      setIsPlaying(false);

      setCurrentTime(0);

      audio.currentTime = 0;
    };

    audio.addEventListener(
      "timeupdate",
      updateTime
    );

    audio.addEventListener(
      "ended",
      onEnded
    );

    return () => {

      audio.removeEventListener(
        "timeupdate",
        updateTime
      );

      audio.removeEventListener(
        "ended",
        onEnded
      );
    };

  }, []);

  // ─────────────────────────────
  // TOGGLE
  // ─────────────────────────────
  const togglePlayback = () => {

    setIsPlaying(
      !isPlaying
    );
  };

  // ─────────────────────────────
  // RESET
  // ─────────────────────────────
  const resetPlayback = () => {

    const audio =
      audioRef.current;

    if (!audio) return;

    audio.pause();

    audio.currentTime = 0;

    setCurrentTime(0);

    setIsPlaying(false);
  };

  return (

    <div className="
      flex
      items-center
      gap-3
      bg-zinc-900
      border-b
      border-zinc-700
      px-4
      py-3
    ">

      {/* PLAY */}
      <button
        onClick={togglePlayback}
        className="
          size-10
          rounded-full
          bg-green-500
          text-black
          flex
          items-center
          justify-center
          hover:scale-105
          transition-all
        "
      >

        {isPlaying
          ? <Pause className="size-5" />
          : <Play className="size-5" />
        }

      </button>

      {/* RESET */}
      <button
        onClick={resetPlayback}
        className="
          size-10
          rounded-full
          bg-zinc-800
          text-white
          flex
          items-center
          justify-center
          hover:bg-zinc-700
          transition-all
        "
      >

        <RotateCcw className="size-5" />

      </button>

      {/* TIMELINE */}
      <div className="flex-1">

        <input
          type="range"

          min={0}

          max={
            audioRef.current
              ?.duration || 0
          }

          step={0.01}

          value={currentTime}

          onChange={(e) => {

            const t =
              Number(
                e.target.value
              );

            setCurrentTime(t);

            if (
              audioRef.current
            ) {

              audioRef.current.currentTime =
                t;
            }
          }}

          className="
            w-full
          "
        />

      </div>

      {/* AUDIO */}
      <audio
        ref={audioRef}
      />

    </div>
  );
}