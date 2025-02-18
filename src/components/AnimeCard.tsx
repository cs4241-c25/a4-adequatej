'use client';

interface Anime {
  id: string;
  title: string;
  rating: number;
  episodes: number;
  popularityScore?: number;
  imageUrl?: string;
}

interface AnimeCardProps {
  anime: Anime;
  onEdit: (anime: Anime) => void;
  onDelete: (id: string) => void;
}

export default function AnimeCard({ anime, onEdit, onDelete }: AnimeCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {anime.imageUrl && (
        <div className="aspect-video relative">
          <img
            src={anime.imageUrl}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {anime.title}
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-gray-700 dark:text-gray-300">
              Rating:
            </span>
            <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              {anime.rating}/10
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-gray-700 dark:text-gray-300">
              Episodes:
            </span>
            <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              {anime.episodes}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-gray-700 dark:text-gray-300">
              Popularity Score:
            </span>
            <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
              {anime.popularityScore?.toFixed(1)}
            </span>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onEdit(anime)}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(anime.id)}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
