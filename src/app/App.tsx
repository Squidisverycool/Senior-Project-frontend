import { useState, useEffect, useRef } from "react";

import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

import { AudioUploadSection } from "@/app/components/AudioUploadSection";

import { PitchVisualization } from "@/app/components/PitchVisualization";

import { SingAlongSection } from "@/app/components/SingAlongSection";
import { TimelineAudioPlayer } from "@/app/components/TimelineAudioPlayer";
import {
  ArrowDown,
  SlidersHorizontal,
} from "lucide-react";

import {
  NoteTableEditor,
  Note,
} from "@/app/components/NoteTableEditor";

import { mockNotes } from "@/mock/mockNotes";

export default function App() {

  // ─────────────────────────────
  // STATES
  // ─────────────────────────────
  const [currentTime, setCurrentTime] =
  useState(0);

const [isPlaying, setIsPlaying] =
  useState(false);
  const [curveMode, setCurveMode] =
    useState<"discrete" | "curved">(
      "discrete"
    );

  const [uploadedFile, setUploadedFile] =
    useState<File | null>(null);

  const [notes, setNotes] =
    useState<Note[]>([]);

  const [isRecording, setIsRecording] =
    useState(false);

  const [activePanel, setActivePanel] =
    useState<
      "none"
      | "notes"
    >("none");

  // ─────────────────────────────
  // VISUALIZATION FILTERS
  // ─────────────────────────────
  const [showReliable, setShowReliable] =
    useState(true);

  const [showUncertain, setShowUncertain] =
    useState(true);

  const [showUnstable, setShowUnstable] =
    useState(true);

  const visualizationRef =
    useRef<HTMLElement>(null);

  // ─────────────────────────────
  // FILE UPLOAD
  // ─────────────────────────────
  const handleFileUploaded = (
    file: File
  ) => {

    setUploadedFile(file);

    setNotes(mockNotes.notes);
  };

  // ─────────────────────────────
  // AUTO SCROLL
  // ─────────────────────────────
  useEffect(() => {

    if (
      uploadedFile &&
      visualizationRef.current
    ) {

      setTimeout(() => {

        visualizationRef.current
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

      }, 500);
    }

  }, [uploadedFile]);

  // ─────────────────────────────
  // PANEL TOGGLE
  // ─────────────────────────────
  const togglePanel = (
    panel: "notes"
  ) => {

    setActivePanel((prev) =>
      prev === panel
        ? "none"
        : panel
    );
  };

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="
      min-h-screen
      bg-gradient-to-b
      from-zinc-950
      via-zinc-900
      to-black
    ">

      <Header />

      <main
        className="
          max-w-7xl
          mx-auto
          px-4 md:px-6
          py-6 md:py-8
          space-y-6 md:space-y-8
        "
      >

        {/* STEP 1 */}
        <section>

          <div className="
            flex
            items-center
            gap-3
            mb-4
          ">

            <div className="step-badge">
              1
            </div>

            <h2 className="
              text-2xl
              font-bold
              text-white
            ">
              Upload Your Song
            </h2>

          </div>

          <AudioUploadSection
            onFileUploaded={
              handleFileUploaded
            }
          />

        </section>

        {uploadedFile && (
          <>

            {/* ARROW */}
            <div className="flex justify-center">

              <ArrowDown
                className="
                  size-6
                  text-green-500
                  animate-bounce
                "
              />

            </div>

            {/* STEP 2 */}
            <section ref={visualizationRef}>

              <div className="
                flex
                items-center
                gap-3
                mb-4
              ">

                <div className="step-badge">
                  2
                </div>

                <h2 className="
                  text-2xl
                  font-bold
                  text-white
                ">
                  Visualize & Adjust Pitch
                </h2>

              </div>

              <div className="
                relative
                rounded-xl
                overflow-hidden
              ">
<TimelineAudioPlayer
  uploadedFile={uploadedFile}

  currentTime={currentTime}
  setCurrentTime={setCurrentTime}

  isPlaying={isPlaying}
  setIsPlaying={setIsPlaying}
/>
                {/* VISUALIZATION */}
                <PitchVisualization
  notes={notes}

  isRecording={isRecording}

  currentTime={currentTime}
  setCurrentTime={setCurrentTime}

  isPlaying={isPlaying}

  showReliable={showReliable}
  showUncertain={showUncertain}
  showUnstable={showUnstable}
/>

                {/* NOTES BUTTON */}
                <div className="
                  absolute
                  bottom-4
                  right-4
                  z-10
                ">

                  <button
                    onClick={() =>
                      togglePanel(
                        "notes"
                      )
                    }

                    className={`
                      flex
                      items-center
                      gap-2
                      px-3 py-2
                      rounded-lg
                      text-sm
                      font-medium
                      transition-all
                      shadow-lg
                      ${
                        activePanel === "notes"
                          ? "bg-green-500 text-black"
                          : "bg-zinc-800/90 text-white hover:bg-zinc-700"
                      }
                    `}
                  >

                    <SlidersHorizontal
                      className="size-4"
                    />

                    Notes

                  </button>

                </div>

                {/* NOTES PANEL */}
                <div
                  className={`
                    transition-all
                    duration-300
                    ease-in-out
                    overflow-hidden
                    bg-zinc-900
                    border-t
                    border-zinc-700
                    ${
                      activePanel === "notes"
                        ? "max-h-[800px] opacity-100"
                        : "max-h-0 opacity-0"
                    }
                  `}
                >

                  <div className="
                    p-4
                    space-y-6
                  ">

                    {/* VISIBILITY FILTER */}
                    <div>

                      <label className="
                        text-sm
                        text-zinc-300
                        mb-3
                        block
                      ">
                        Visibility Filter
                      </label>

                      <div className="
                        flex
                        flex-wrap
                        gap-2
                      ">

                        {/* RELIABLE */}
                        <button
                          onClick={() =>
                            setShowReliable(
                              (v) => !v
                            )
                          }

                          className={`
                            px-3 py-2
                            rounded-lg
                            text-sm
                            font-medium
                            transition-all
                            ${
                              showReliable
                                ? "bg-green-600 text-white"
                                : "bg-zinc-800 text-zinc-400"
                            }
                          `}
                        >
                          Reliable
                        </button>

                        {/* UNCERTAIN */}
                        <button
                          onClick={() =>
                            setShowUncertain(
                              (v) => !v
                            )
                          }

                          className={`
                            px-3 py-2
                            rounded-lg
                            text-sm
                            font-medium
                            transition-all
                            ${
                              showUncertain
                                ? "bg-yellow-500 text-black"
                                : "bg-zinc-800 text-zinc-400"
                            }
                          `}
                        >
                          Uncertain
                        </button>

                        {/* UNSTABLE */}
                        <button
                          onClick={() =>
                            setShowUnstable(
                              (v) => !v
                            )
                          }

                          className={`
                            px-3 py-2
                            rounded-lg
                            text-sm
                            font-medium
                            transition-all
                            ${
                              showUnstable
                                ? "bg-red-600 text-white"
                                : "bg-zinc-800 text-zinc-400"
                            }
                          `}
                        >
                          Unstable
                        </button>

                      </div>

                    </div>

                    {/* NOTE TABLE */}
                    <NoteTableEditor
                      notes={notes}
                      onChange={setNotes}
                    />

                  </div>

                </div>

              </div>

            </section>

            {/* ARROW */}
            <div className="flex justify-center">

              <ArrowDown
                className="
                  size-6
                  text-green-500
                  animate-bounce
                "
              />

            </div>

            {/* STEP 3 */}
            <section>

              <div className="
                flex
                items-center
                gap-3
                mb-4
              ">

                <div className="step-badge">
                  3
                </div>

                <h2 className="
                  text-2xl
                  font-bold
                  text-white
                ">
                  Practice & Record
                </h2>

              </div>

             <SingAlongSection
  audioFile={uploadedFile}
  onRecordingChange={
    setIsRecording
  }
/>

            </section>

          </>
        )}

      </main>

      <Footer />

    </div>
  );
}