import type { Metadata } from 'next';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { notFound } from 'next/navigation';

import { fetchNotes } from '@/lib/api/serverApi';
import type { NoteTag } from '@/types/note';
import NotesClient from './Notes.client';

const PER_PAGE = 12;
const SITE_URL = 'https://08-zustand-sepia-eight.vercel.app';
const OG_IMAGE = 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg';
const validTags: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];

interface FilteredNotesPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({
  params,
}: FilteredNotesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const selectedTag = slug[0];

  if (!selectedTag) {
    return {
      title: 'Notes | NoteHub',
      description: 'Browse notes in NoteHub.',
      openGraph: {
        title: 'Notes | NoteHub',
        description: 'Browse notes in NoteHub.',
        url: `${SITE_URL}/notes/filter/all`,
        images: [
          {
            url: OG_IMAGE,
            width: 1200,
            height: 630,
            alt: 'NoteHub application preview',
          },
        ],
      },
    };
  }

  const filterName = selectedTag === 'all' ? 'All notes' : selectedTag;

  return {
    title: `${filterName} | NoteHub`,
    description: `Browse notes filtered by ${filterName} in NoteHub.`,
    openGraph: {
      title: `${filterName} | NoteHub`,
      description: `Browse notes filtered by ${filterName} in NoteHub.`,
      url: `${SITE_URL}/notes/filter/${selectedTag}`,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: 'NoteHub application preview',
        },
      ],
    },
  };
}

export default async function FilteredNotesPage({
  params,
}: FilteredNotesPageProps) {
  const { slug } = await params;
  const selectedTag = slug[0];

  if (!selectedTag) {
    notFound();
  }

  if (selectedTag !== 'all' && !validTags.includes(selectedTag as NoteTag)) {
    notFound();
  }

  const tag = selectedTag === 'all' ? undefined : (selectedTag as NoteTag);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['notes', 1, '', tag],
    queryFn: () =>
      fetchNotes({
        page: 1,
        perPage: PER_PAGE,
        search: '',
        tag,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={tag} />
    </HydrationBoundary>
  );
}