import {
  useState,
  useRef
} from "react";

import {
  Mic,
  MicOff
} from "lucide-react";

import { Button } from "@/app/components/ui/button";

import { Badge } from "@/app/components/ui/badge";

interface SingAlongSectionProps {

  audioFile?: File | null;

  onRecordingChange?: (
    isRecording: boolean
  ) => void;
}

export function SingAlongSection({
  audioFile,
  onRecordingChange
}: SingAlongSectionProps) {

  const [isRecording, setIsRecording] =
    useState(false);

  const [
    micPermission,
    setMicPermission
  ] = useState<
    "granted"
    | "denied"
    | "prompt"
  >("prompt");

  const [countdown, setCountdown] =
    useState<number | null>(null);

  const audioRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  // ─────────────────────────────
  // TOGGLE RECORDING
  // ─────────────────────────────
  const toggleRecording =
    async () => {

      // STOP
      if (isRecording) {

        setIsRecording(false);

        onRecordingChange?.(
          false
        );

        // STOP AUDIO
        if (audioRef.current) {

          audioRef.current.pause();

          audioRef.current.currentTime = 0;
        }

        return;
      }

      // START
      try {

        await navigator
          .mediaDevices
          .getUserMedia({
            audio: true
          });

        setMicPermission(
          "granted"
        );

        // COUNTDOWN
        setCountdown(3);

        let count = 3;

        const interval =
          setInterval(() => {

            count--;

            if (count > 0) {

              setCountdown(
                count
              );

            } else {

              clearInterval(
                interval
              );

              setCountdown(
                null
              );

              // START RECORDING
              setIsRecording(
                true
              );

              onRecordingChange?.(
                true
              );

              // PLAY SONG
              if (audioFile) {

                const url =
                  URL.createObjectURL(
                    audioFile
                  );

                const audio =
                  new Audio(url);

                audioRef.current =
                  audio;

                audio.play();
              }
            }

          }, 1000);

      } catch (error) {

        setMicPermission(
          "denied"
        );
      }
    };

  return (
    <div
      className="
        bg-gradient-to-br
        from-zinc-900
        to-zinc-800
        rounded-2xl
        border border-zinc-700/50
        p-6 md:p-8
        space-y-5
        shadow-2xl
      "
    >

      <div>

        <h3
          className="
            text-xl
            font-bold
            text-white
            mb-2
          "
        >
          Sing Along
        </h3>

        <p
          className="
            text-sm
            text-gray-400
          "
        >
          Press record and
          follow the moving
          pitch guide
        </p>

      </div>

      {/* COUNTDOWN */}
      {countdown !== null && (

        <div
          className="
            flex
            items-center
            justify-center
            h-32
          "
        >

          <div
            className="
              text-6xl
              font-black
              text-green-400
              animate-pulse
            "
          >
            {countdown}
          </div>

        </div>
      )}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          items-start
          sm:items-center
          gap-4
        "
      >

        <Button
          size="lg"

          onClick={
            toggleRecording
          }

          disabled={
            countdown !== null
          }

          className={`
            gap-2
            w-full sm:w-auto
            font-semibold
            shadow-lg
            border-none
            ${
              isRecording
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/30"
                : "bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black shadow-green-500/30"
            }
          `}
        >

          {isRecording ? (
            <>
              <MicOff
                className="size-5"
              />
              Stop Recording
            </>
          ) : (
            <>
              <Mic
                className="size-5"
              />
              Start Recording
            </>
          )}

        </Button>

        {micPermission ===
          "granted" && (

          <Badge
            variant="outline"

            className="
              bg-green-500/10
              text-green-400
              border-green-500/30
              backdrop-blur-sm
            "
          >
            Microphone ready
          </Badge>
        )}

        {micPermission ===
          "denied" && (

          <Badge
            variant="outline"

            className="
              bg-red-500/10
              text-red-400
              border-red-500/30
              backdrop-blur-sm
            "
          >
            Microphone access denied
          </Badge>
        )}

      </div>

    </div>
  );
}