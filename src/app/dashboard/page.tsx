'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import AnimeCard from '@/components/AnimeCard';
import RatingForm from '@/components/RatingForm';

interface Anime {
  id: string;
  title: string;
  rating: number;
  episodes: number;
  popularityScore?: number;
  imageUrl?: string;
}

interface AnimeFromDB {
  _id: string;
  title: string;
  rating: number;
  episodes: number;
  popularityScore: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }

    if (status === 'authenticated') {
      fetchAnimes();
    }
  }, [status, router]);

  const fetchAnimes = async () => {
    try {
      const response = await fetch('/api/anime');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setAnimes(data.map((anime: AnimeFromDB) => ({
        id: anime._id,
        title: anime.title,
        rating: anime.rating,
        episodes: anime.episodes,
        popularityScore: anime.popularityScore
      })));
    } catch (error) {
      console.error('Error fetching animes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (animeData: Omit<Anime, 'id'> & { id?: string }) => {
    try {
      if (editingAnime) {
        const response = await fetch(`/api/anime/${editingAnime.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(animeData),
        });

        if (!response.ok) throw new Error('Failed to update anime');
        
        setEditingAnime(null);
      } else {
        const response = await fetch('/api/anime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(animeData),
        });

        if (!response.ok) throw new Error('Failed to add anime');
      }

      await fetchAnimes();
    } catch (error) {
      console.error('Error saving anime:', error);
    }
  };

  const handleEdit = (anime: Anime) => {
    setEditingAnime(anime);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this anime?')) return;

    try {
      const response = await fetch(`/api/anime/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete anime');

      setAnimes(animes.filter(anime => anime.id !== id));
    } catch (error) {
      console.error('Error deleting anime:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Your Anime List</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Welcome, {session?.user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Sign Out
            </button>
          </div>
        </div>

        <RatingForm 
          onSubmit={handleSubmit} 
          editingAnime={editingAnime}
          onCancel={() => setEditingAnime(null)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animes.length > 0 ? (
            animes.map(anime => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-center text-gray-500">
                No anime added yet. Start by adding your first anime!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
