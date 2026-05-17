import type { AxiosResponse } from 'axios';
import { cookies } from 'next/headers';

import type { Note, NoteTag } from '@/types/note';
import type { User } from '@/types/user';
import { api } from './api';

export interface FetchNotesParams {
  page: number;
  perPage?: number;
  search?: string;
  tag?: NoteTag;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

const getCookieHeader = async (): Promise<string> => {
  const cookieStore = await cookies();
  return cookieStore.toString();
};

export const fetchNotes = async ({
  page,
  perPage = 12,
  search = '',
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const response = await api.get<FetchNotesResponse>('/notes', {
    params: {
      page,
      perPage,
      ...(search.trim() && { search: search.trim() }),
      ...(tag && { tag }),
    },
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const response = await api.get<Note>(`/notes/${id}`, {
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>('/users/me', {
    headers: {
      Cookie: await getCookieHeader(),
    },
  });

  return response.data;
};

export const checkSession = async (
  cookieHeader?: string,
): Promise<AxiosResponse<{ success: boolean }>> => {
  const response = await api.get<{ success: boolean }>('/auth/session', {
    headers: {
      Cookie: cookieHeader ?? (await getCookieHeader()),
    },
  });

  return response;
};