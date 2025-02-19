import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { authOptions } from '@/app/api/auth/auth.config';

function calculatePopularityScore(rating: number, episodes: number): number {
  return (rating / 10 * 0.7 + Math.min(episodes / 100, 1) * 0.3) * 100;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const isDelete = url.searchParams.get('_method') === 'DELETE';
    const id = (await params).id;

    const client = await clientPromise;
    const db = client.db('animedb');
    
    if (isDelete) {
      const result = await db.collection('animes').deleteOne({
        _id: new ObjectId(id),
        userId: session.user?.email,
      });

      if (result.deletedCount === 0) {
        return new Response(JSON.stringify({ error: 'Anime not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const anime = await db.collection('animes').findOne({
      _id: new ObjectId(id),
      userId: session.user?.email,
    });

    if (!anime) {
      return new Response(JSON.stringify({ error: 'Anime not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(anime), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error with anime operation:', error);
    return new Response(JSON.stringify({ error: 'Operation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { title, rating, episodes } = await request.json();
    
    if (!title || !rating || !episodes) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const popularityScore = calculatePopularityScore(rating, episodes);
    const id = (await params).id;

    const client = await clientPromise;
    const db = client.db('animedb');
    
    const result = await db.collection('animes').updateOne(
      {
        _id: new ObjectId(id),
        userId: session.user?.email,
      },
      {
        $set: {
          title,
          rating,
          episodes,
          popularityScore,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Anime not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      popularityScore 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating anime:', error);
    return new Response(JSON.stringify({ error: 'Failed to update anime' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
