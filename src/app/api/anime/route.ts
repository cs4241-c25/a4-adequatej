import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import clientPromise from '@/lib/mongodb';
import { authOptions } from '../auth/[...nextauth]/route';

// helper for calculating popularity score
function calculatePopularityScore(rating: number, episodes: number): number {
  return (rating / 10 * 0.7 + Math.min(episodes / 100, 1) * 0.3) * 100;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, rating, episodes, imageUrl } = await request.json();
    
    if (!title || !rating || !episodes) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    return NextResponse.json({
      id: result.insertedId,
      title,
      rating,
      episodes,
      imageUrl,
      popularityScore,
    });
  } catch (error) {
    console.error('Error adding anime:', error);
    return NextResponse.json(
      { error: 'Failed to add anime' },
      { status: 500 }
    );
  }
}
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('animedb');
    
    const animes = await db.collection('animes')
      .find({ userId: session.user?.email })
      .sort({ popularityScore: -1 }) 
      .toArray();

    return NextResponse.json(animes);
  } catch (error) {
    console.error('Error fetching animes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch animes' },
      { status: 500 }
    );
  }
}

