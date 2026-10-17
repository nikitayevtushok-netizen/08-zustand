"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState, type ChangeEvent } from "react";
import { useDebouncedCallback } from "use-debounce";
import { fetchNotes } from "@/lib/api/notes";
import ErrorMessage from "@/components/ErrorMessage/ErrorMessage";
import Loader from "@/components/Loader/Loader";
import NoteList from "@/components/NoteList/NoteList";
import Pagination from "@/components/Pagination/Pagination";
import SearchBox from "@/components/SearchBox/SearchBox";
import css from "./NotesPage.module.css";
import { NoteTag } from "@/types/note";
import Link from "next/link";

type Props = {
  tag: string;
};

const PER_PAGE = 12;
const SEARCH_DELAY = 500;

export default function NotesClient({ tag }: Props) {
  const apiTag = tag === "all" ? undefined : (tag as NoteTag);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const updateDebouncedSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
    setPage(1);
  }, SEARCH_DELAY);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearch(value);
    updateDebouncedSearch(value);
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "notes",
      { page, perPage: PER_PAGE, search: debouncedSearch, tag: apiTag ?? "" },
    ],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: PER_PAGE,
        search: debouncedSearch || undefined,
        ...(apiTag && { tag: apiTag }),
      }),
    placeholderData: keepPreviousData,
  });

  const errorMessage =
    error instanceof Error ? error.message : "Failed to load notes";

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={search} onChange={handleSearchChange} />
        {data && data.totalPages > 1 && (
          <Pagination
            totalPages={data.totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}
        <Link href="/notes/action/create" className={css.button}>
          Create note +
        </Link>
      </header>

      {isLoading && <Loader />}
      {isError && <ErrorMessage message={errorMessage} />}
      {data && data.notes.length > 0 && <NoteList notes={data.notes} />}
    </div>
  );
}
