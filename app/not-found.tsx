import type { Metadata } from 'next';
import css from './not-found.module.css';

const SITE_URL = 'https://08-zustand-sepia-eight.vercel.app';
const OG_IMAGE = 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg';

export const metadata: Metadata = {
  title: '404 - Page not found | NoteHub',
  description: 'The requested NoteHub page does not exist.',
  openGraph: {
    title: '404 - Page not found | NoteHub',
    description: 'The requested NoteHub page does not exist.',
    url: `${SITE_URL}/not-found`,
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

export default function NotFound() {
  return (
    <>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>
        Sorry, the page you are looking for does not exist.
      </p>
    </>
  );
}