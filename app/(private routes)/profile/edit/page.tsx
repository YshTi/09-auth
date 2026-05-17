'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getMe, updateMe } from '@/lib/api/clientApi';
import type { User } from '@/types/user';
import { useAuthStore } from '@/lib/store/authStore';
import css from './EditProfilePage.module.css';

export default function EditProfile() {
  const router = useRouter();
  const setUser = useAuthStore(state => state.setUser);

  const [user, setLocalUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getMe();
      setLocalUser(currentUser);
      setUsername(currentUser.username);
    };

    loadUser();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const updatedUser = await updateMe({ username });
    setUser(updatedUser);
    router.push('/profile');
  };

  if (!user) {
    return <p>Loading, please wait...</p>;
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        <Image
          src={user.avatar}
          alt="User Avatar"
          width={120}
          height={120}
          className={css.avatar}
        />

        <form className={css.profileInfo} onSubmit={handleSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              className={css.input}
              value={username}
              onChange={event => setUsername(event.target.value)}
            />
          </div>

          <p>Email: {user.email}</p>

          <div className={css.actions}>
            <button type="submit" className={css.saveButton}>
              Save
            </button>
            <button
              type="button"
              className={css.cancelButton}
              onClick={() => router.push('/profile')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}