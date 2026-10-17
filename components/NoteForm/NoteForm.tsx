"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "@/lib/api/notes";
import type { CreateNotePayload, NoteTag } from "@/types/note";
import { NOTE_TAGS } from "@/lib/noteTags";
import { useNoteDraftStore } from "@/lib/store/noteStore";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import css from "./NoteForm.module.css";

const isNoteTag = (value: string): value is NoteTag =>
  NOTE_TAGS.includes(value as NoteTag);

const parseCreateNotePayload = (formData: FormData): CreateNotePayload => {
  const title = formData.get("title");
  const content = formData.get("content");
  const tag = formData.get("tag");

  if (
    typeof title !== "string" ||
    typeof content !== "string" ||
    typeof tag !== "string"
  ) {
    throw new Error("Invalid form data");
  }

  if (!isNoteTag(tag)) {
    throw new Error("Invalid tag");
  }

  return { title, content, tag };
};

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { draft, setDraft, clearDraft } = useNoteDraftStore();
  const isHydrated = useSyncExternalStore(
    useNoteDraftStore.subscribe,
    () => useNoteDraftStore.persist?.hasHydrated() ?? false,
    () => false,
  );
  const [formError, setFormError] = useState("");

  const createNoteMutation = useMutation({ mutationFn: createNote });

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormError("");

    if (name === "title") {
      setDraft({ ...draft, title: value });
    } else if (name === "content") {
      setDraft({ ...draft, content: value });
    } else if (name === "tag" && isNoteTag(value)) {
      setDraft({ ...draft, tag: value });
    }
  };

  const formAction = async (formData: FormData) => {
    setFormError("");

    try {
      const values = parseCreateNotePayload(formData);
      await createNoteMutation.mutateAsync(values);
      clearDraft();
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push("/notes/filter/all");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to create note",
      );
    }
  };

  if (!isHydrated) {
    return null;
  }

  return (
    <form className={css.form} action={formAction}>
      {formError && <ErrorMessage message={formError} />}
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          className={css.input}
          defaultValue={draft.title}
          onChange={handleChange}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          defaultValue={draft.content}
          onChange={handleChange}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          defaultValue={draft.tag}
          onChange={handleChange}
        >
          {NOTE_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={css.submitButton}
          disabled={createNoteMutation.isPending}
        >
          Create note
        </button>
      </div>
    </form>
  );
}
