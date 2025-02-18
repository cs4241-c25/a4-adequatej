'use client';

import { FormEvent, useState, useEffect } from 'react';

interface Anime {
  id?: string;
  title: string;
  rating: number;
  episodes: number;
}

interface RatingFormProps {
  onSubmit: (anime: Anime) => Promise<void>;
  editingAnime?: Anime | null;
  onCancel?: () => void;
}

export default function RatingForm({ onSubmit, editingAnime, onCancel }: RatingFormProps) {
  const [title, setTitle] = useState('');
  const [rating, setRating] = useState<string>('');
  const [episodes, setEpisodes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingAnime) {
      setTitle(editingAnime.title);
      setRating(editingAnime.rating.toString());
      setEpisodes(editingAnime.episodes.toString());
    } else {
      setTitle('');
      setRating('');
      setEpisodes('');
    }
  }, [editingAnime]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit({
        title,
        rating: Number(rating),
        episodes: Number(episodes),
      });
      if (!editingAnime) {
        setTitle('');
        setRating('');
        setEpisodes('');
      }
    } catch (error) {
      console.error('Error submitting anime:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 mb-8 p-6">
      <div>
        <label htmlFor="title" className="block text-base font-medium mb-1 text-gray-900 dark:text-gray-100">
          Anime Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          required
          placeholder="Enter anime title"
        />
      </div>
      <div>
        <label htmlFor="rating" className="block text-base font-medium mb-1 text-gray-900 dark:text-gray-100">
          Rating (1-10)
        </label>
        <input
          type="number"
          id="rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          min="1"
          max="10"
          className="input-field"
          required
          placeholder="Enter rating (1-10)"
        />
      </div>
      <div>
        <label htmlFor="episodes" className="block text-base font-medium mb-1 text-gray-900 dark:text-gray-100">
          Number of Episodes
        </label>
        <input
          type="number"
          id="episodes"
          value={episodes}
          onChange={(e) => setEpisodes(e.target.value)}
          min="1"
          className="input-field"
          required
          placeholder="Enter number of episodes"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1"
        >
          {isLoading ? 'Saving...' : editingAnime ? 'Update Anime' : 'Add Anime'}
        </button>
        {editingAnime && (
          <button
            type="button"
            onClick={onCancel}
            className="btn-primary bg-gray-500 hover:bg-gray-600 flex-1"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
