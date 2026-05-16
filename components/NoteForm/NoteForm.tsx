'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChangeEvent, FormEvent } from 'react';

import { createNote } from '@/lib/api';
import { useNoteStore } from '@/lib/store/noteStore';
import type { NoteDraft, NoteTag } from '@/types/note';
import css from './NoteForm.module.css';

const noteTags: NoteTag[] = ['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'];

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const draft = useNoteStore(state => state.draft);
  const setDraft = useNoteStore(state => state.setDraft);
  const clearDraft = useNoteStore(state => state.clearDraft);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setDraft({
      ...draft,
      [name]: value,
    } as NoteDraft);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await mutateAsync(draft);
    clearDraft();
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <form className={css.form} onSubmit={handleSubmit}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          className={css.input}
          type="text"
          name="title"
          value={draft.title}
          onChange={handleChange}
          required
          minLength={3}
          maxLength={50}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          className={css.textarea}
          name="content"
          value={draft.content}
          onChange={handleChange}
          required
          minLength={3}
          maxLength={500}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          className={css.select}
          name="tag"
          value={draft.tag}
          onChange={handleChange}
        >
          {noteTags.map(tag => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div className={css.actions}>
        <button
          className={css.cancelButton}
          type="button"
          onClick={handleCancel}
        >
          Cancel
        </button>

        <button className={css.submitButton} type="submit" disabled={isPending}>
          Create note
        </button>
      </div>
    </form>
  );
}