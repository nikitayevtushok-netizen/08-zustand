import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import NoteDetailsClient from "./NoteDetails.client";
import { fetchNoteById } from "@/lib/api/notes";
import type { Metadata } from "next";
import axios from "axios";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const note = await fetchNoteById(id);

    const title = `${note.title} | NoteHub`;
    const description = note.content.slice(0, 160);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://08-zustand-pink-three.vercel.app/notes/${id}`,
        images: [
          {
            url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
            width: 1200,
            height: 630,
            alt: "NoteHub",
          },
        ],
      },
    };
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) {
      throw error;
    }

    return {
      title: "Note not found | NoteHub",
      description: "The requested note could not be found.",
      openGraph: {
        title: "Note not found | NoteHub",
        description: "The requested note could not be found.",
        url: `https://08-zustand-pink-three.vercel.app/notes/${id}`,
        images: [
          {
            url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
            width: 1200,
            height: 630,
            alt: "NoteHub",
          },
        ],
      },
    };
  }
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function NoteDetailsPage({ params }: Props) {
  const { id } = await params;

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}
