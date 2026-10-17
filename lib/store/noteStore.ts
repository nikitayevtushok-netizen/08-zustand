import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CreateNotePayload } from "@/types/note";

type NoteDraftStore = {
  draft: CreateNotePayload;
  setDraft: (note: CreateNotePayload) => void;
  clearDraft: () => void;
};

const initialDraft: CreateNotePayload = {
  title: "",
  content: "",
  tag: "Todo",
};

export const useNoteDraftStore = create<NoteDraftStore>()(
  persist(
    (set) => ({
      draft: initialDraft,
      setDraft: (note) => set({ draft: note }),
      clearDraft: () => set({ draft: initialDraft }),
    }),
    {
      name: "note-draft",
      partialize: (state) => ({ draft: state.draft }),
    },
  ),
);
