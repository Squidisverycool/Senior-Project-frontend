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
  Loader2,
} from "lucide-react";

import {
  NoteTableEditor,
  Note,
} from "@/app/components/NoteTableEditor";

export default function App() {

  // ─────────────────────────────
  // STATES
  // ─────────────────────────────
  const [currentTime, setCurrentTime] =
    useState(0);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [uploadedFile, setUploadedFile] =
    useState<File | null>(null);

  const [notes, setNotes] =
    useState<Note[]>([]);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [analysisComplete, setAnalysisComplete] =
    useState(false);

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
  // BACKEND ANALYSIS
  // ─────────────────────────────
  const analyzeAudio =
    async (
      file: File
    ) => {

      try {

        setIsAnalyzing(true);

        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        const response =
          await fetch(
            "https://web-production-e460a.up.railway.app/analyze",
            {
              method: "POST",
              body: formData,
            }
          );

        if (!response.ok) {

          const text =
            await response.text();

          console.error(text);

          throw new Error(text);
        }

        const data =
          await response.json();

        setNotes(
          data.notes || []
        );

        setAnalysisComplete(true);

      } catch (err) {

        console.error(err);

        alert(
          "Audio analysis failed"
        );

      } finally {

        setIsAnalyzing(false);
      }
    };

  // ─────────────────────────────
  // FILE UPLOAD
  // ─────────────────────────────
  const handleFileUploaded =
    async (
      file: File
    ) => {

      setUploadedFile(file);

      setAnalysisComplete(false);

      await analyzeAudio(file);
    };

  // ─────────────────────────────
  // AUTO SCROLL
  // ─────────────────────────────
  useEffect(() => {

    if (
      analysisComplete &&
      visualizationRef.current
    ) {

      setTimeout(() => {

        visualizationRef.current
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

      }, 300);

    }

  }, [analysisComplete]);

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

        {/* FULLSCREEN LOADING */}
        {isAnalyzing && (

          <div className="
            min-h-[70vh]
            flex
            flex-col
            items-center
            justify-center
            gap-8
          ">

            {/* SPINNER */}
            <div className="
              relative
              flex
              items-center
              justify-center
            ">

              <div className="
                absolute
                size-28
                rounded-full
                bg-green-500/10
                blur-2xl
              " />

              <Loader2
                className="
                  size-16
                  text-green-500
                  animate-spin
                "
              />

            </div>

            {/* TEXT */}
            <div className="
              text-center
              space-y-3
            ">

              <h2 className="
                text-3xl
                font-bold
                text-white
              ">
                Analyzing Audio
              </h2>

              <p className="
                text-zinc-400
                max-w-lg
                leading-relaxed
              ">

                Running vocal separation,
                pitch detection,
                reliability analysis,
                and note segmentation...

              </p>

            </div>

            {/* PROGRESS BAR */}
            <div className="
              w-full
              max-w-xl
              h-3
              rounded-full
              overflow-hidden
              bg-zinc-800
            ">

              <div className="
                h-full
                w-full
                bg-gradient-to-r
                from-green-500
                via-emerald-400
                to-green-500
                animate-pulse
              " />

            </div>

          </div>
        )}

        {/* MAIN CONTENT */}
        {analysisComplete && uploadedFile && (
          <>

            {/* ARROW */}
            <div className="
              flex
              justify-center
            ">

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

                {/* AUDIO PLAYER */}
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
            <div className="
              flex
              justify-center
            ">

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