import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { authOptions } from '@/app/api/auth/auth.config';

// helper for calculating popularity score
function calculatePopularityScore(rating: number, episodes: number): number {
  return (rating / 10 * 0.7 + Math.min(episodes / 100, 1) * 0.3) * 100;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const client = await clientPromise;
    const db = client.db('animedb');
    
    const animes = await db.collection('animes')
      .find({ userId: session.user?.email })
      .sort({ popularityScore: -1 }) 
      .toArray();

    return new Response(JSON.stringify(animes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching animes:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch animes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { title, rating, episodes, imageUrl } = await request.json();
    
    if (!title || !rating || !episodes) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const popularityScore = calculatePopularityScore(rating, episodes);

    const client = await clientPromise;
    const db = client.db('animedb');
    
    const result = await db.collection('animes').insertOne({
      title,
      rating,
      episodes,
      imageUrl,
      popularityScore,
      userId: session.user?.email,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({
      id: result.insertedId,
      title,
      rating,
      episodes,
      imageUrl,
      popularityScore,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error adding anime:', error);
    return new Response(JSON.stringify({ error: 'Failed to add anime' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

