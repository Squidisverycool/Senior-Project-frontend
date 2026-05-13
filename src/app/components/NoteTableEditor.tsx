import {
  Trash2,
  RotateCcw
} from "lucide-react";

import { Note } from "@/app/components/NoteTableEditor";

const NOTE_OPTIONS = [

  "silence",

  // C2 → B2
  "C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2","A2","A#2","B2",

  // C3 → B3
  "C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3",

  // C4 → B4
  "C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4",

  // C5 → B5
  "C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5",

];

interface Props {
  notes: Note[];
  onChange: (notes: Note[]) => void;
}

export function NoteTableEditor({
  notes,
  onChange
}: Props) {

  // ─────────────────────────────
  // UPDATE NOTE
  // ─────────────────────────────
  const updateNote = (
    index: number,
    updated: Partial<Note>
  ) => {

    const next = [...notes];

    next[index] = {
      ...next[index],
      ...updated
    };

    onChange(next);
  };

  // ─────────────────────────────
  // TOGGLE DISABLED
  // ─────────────────────────────
  const toggleDisabled = (
    index: number
  ) => {

    const next = [...notes];

    next[index] = {
      ...next[index],
      disabled:
        !next[index].disabled
    };

    onChange(next);
  };

  // ─────────────────────────────
  // RELIABILITY STYLE
  // ─────────────────────────────
  const getReliabilityStyle = (
    reliability?: number
  ) => {

    if (reliability === undefined) {
      return {
        label: "Unknown",
        className:
          "bg-zinc-700 text-zinc-200"
      };
    }

    if (reliability > 0.8) {
      return {
        label: "Reliable",
        className:
          "bg-green-700 text-white"
      };
    }

    if (reliability > 0.6) {
      return {
        label: "Uncertain",
        className:
          "bg-yellow-600 text-black"
      };
    }

    return {
      label: "Unstable",
      className:
        "bg-red-700 text-white"
    };
  };

  return (

    <div className="
      mt-6
      rounded-xl
      border border-zinc-700
      bg-zinc-900
      overflow-hidden
    ">

      {/* SCROLL CONTAINER */}
      <div className="
        max-h-[420px]
        overflow-y-auto
        overflow-x-auto
      ">

        <table className="
          w-full
          text-sm
          text-white
        ">

          {/* HEADER */}
          <thead className="
            sticky
            top-0
            z-10
            bg-zinc-800
            text-zinc-300
          ">

            <tr>

              <th className="
                px-4 py-3
                text-left
              ">
                Note
              </th>

              <th className="
                px-4 py-3
                text-left
              ">
                Start (s)
              </th>

              <th className="
                px-4 py-3
                text-left
              ">
                End (s)
              </th>

              <th className="
                px-4 py-3
                text-left
              ">
                Reliability
              </th>

              <th className="
                px-4 py-3
                text-center
              ">
                Visibility
              </th>

            </tr>

          </thead>

          {/* BODY */}
          <tbody>

            {notes.map((note, i) => {

              const reliabilityUI =
                getReliabilityStyle(
                  note.reliability
                );

              const isDisabled =
                note.disabled === true;

              return (

                <tr
                  key={i}

                  className={`
                    border-t
                    border-zinc-700
                    transition-all
                    ${
                      isDisabled
                        ? "opacity-40 bg-zinc-950"
                        : "hover:bg-zinc-800/40"
                    }
                  `}
                >

                  {/* NOTE */}
                  <td className="
                    px-4 py-3
                  ">

                    <select
                      disabled={
                        isDisabled
                      }

                      className={`
                        bg-zinc-800
                        border border-zinc-600
                        rounded
                        px-2 py-1
                        ${
                          isDisabled
                            ? "line-through opacity-70"
                            : ""
                        }
                      `}

                      value={
                        note.type === "silence"
                          ? "silence"
                          : note.note_name
                      }

                      onChange={(e) => {

                        const value =
                          e.target.value;

                        // SILENCE
                        if (
                          value === "silence"
                        ) {

                          updateNote(i, {
                            type: "silence",
                            note_name:
                              "silence"
                          });

                          return;
                        }

                        // NORMAL NOTE
                        updateNote(i, {
                          type: "note",
                          note_name: value
                        });
                      }}
                    >

                      {NOTE_OPTIONS.map((n) => (

                        <option
                          key={n}
                          value={n}
                        >

                          {
                            n === "silence"
                              ? "Silence"
                              : n
                          }

                        </option>

                      ))}

                    </select>

                  </td>

                  {/* START */}
                  <td className="
                    px-4 py-3
                  ">

                    <input
                      type="number"

                      step="0.05"

                      disabled={
                        isDisabled
                      }

                      className={`
                        w-24
                        bg-zinc-800
                        border border-zinc-600
                        rounded
                        px-2 py-1
                        ${
                          isDisabled
                            ? "line-through opacity-70"
                            : ""
                        }
                      `}

                      value={note.start}

                      onChange={(e) =>
                        updateNote(i, {
                          start: Number(
                            e.target.value
                          )
                        })
                      }
                    />

                  </td>

                  {/* END */}
                  <td className="
                    px-4 py-3
                  ">

                    <input
                      type="number"

                      step="0.05"

                      disabled={
                        isDisabled
                      }

                      className={`
                        w-24
                        bg-zinc-800
                        border border-zinc-600
                        rounded
                        px-2 py-1
                        ${
                          isDisabled
                            ? "line-through opacity-70"
                            : ""
                        }
                      `}

                      value={note.end}

                      onChange={(e) =>
                        updateNote(i, {
                          end: Number(
                            e.target.value
                          )
                        })
                      }
                    />

                  </td>

                  {/* RELIABILITY */}
                  <td className="
                    px-4 py-3
                  ">

                    <div
                      className={`
                        inline-flex
                        items-center
                        rounded-md
                        px-3 py-1
                        text-xs
                        font-medium
                        ${reliabilityUI.className}
                      `}
                    >

                      {reliabilityUI.label}

                      {note.reliability !== undefined && (
                        <span className="
                          ml-2
                          opacity-80
                        ">
                          (
                          {note.reliability.toFixed(2)}
                          )
                        </span>
                      )}

                    </div>

                  </td>

                  {/* TOGGLE */}
                  <td className="
                    px-4 py-3
                    text-center
                  ">

                    <button
                      onClick={() =>
                        toggleDisabled(i)
                      }

                      className={`
                        inline-flex
                        items-center
                        justify-center
                        rounded-md
                        p-2
                        transition-all
                        ${
                          isDisabled
                            ? "text-green-400 hover:bg-green-500/10 hover:text-green-300"
                            : "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        }
                      `}
                    >

                      {isDisabled ? (
                        <RotateCcw
                          className="size-4"
                        />
                      ) : (
                        <Trash2
                          className="size-4"
                        />
                      )}

                    </button>

                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}