'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';

import NoteList from '@/components/NoteList/NoteList';
import Pagination from '@/components/Pagination/Pagination';
import SearchBox from '@/components/SearchBox/SearchBox';
import { fetchNotes } from '@/lib/api';
import type { NoteTag } from '@/types/note';

import css from '@/app/notes/NotesPage.module.css';

const PER_PAGE = 12;

interface NotesClientProps {
  tag?: NoteTag;
}

export default function NotesClient({ tag }: NotesClientProps) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSetSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, 500);

  const queryKey = useMemo(
    () => ['notes', page, searchQuery, tag] as const,
    [page, searchQuery, tag],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () =>
      fetchNotes({
        page,
        perPage: PER_PAGE,
        search: searchQuery,
        tag,
      }),
    placeholderData: keepPreviousData,
  });

  const notes = data?.notes ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <main className={css.app}>
      <div className={css.toolbar}>
        <SearchBox onSearch={debouncedSetSearch} />

        {totalPages > 1 && (
          <Pagination
            pageCount={totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        )}

        <Link href="/notes/action/create" className={css.button}>
          Create note +
        </Link>
      </div>

      {isLoading && <p>Loading, please wait...</p>}
      {isError && <p>{error.message || 'Failed to load notes.'}</p>}
      {!isLoading && !isError && notes.length > 0 && <NoteList notes={notes} />}
      {!isLoading && !isError && notes.length === 0 && <p>No notes found.</p>}
    </main>
  );
}