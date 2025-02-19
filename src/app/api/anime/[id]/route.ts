import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { authOptions } from '../../auth/[...nextauth]/route';

function calculatePopularityScore(rating: number, episodes: number): number {
  return (rating / 10 * 0.7 + Math.min(episodes / 100, 1) * 0.3) * 100;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, rating, episodes, imageUrl } = await request.json();
    
    if (!title || !rating || !episodes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const popularityScore = calculatePopularityScore(rating, episodes);

    const client = await clientPromise;
    const db = client.db('animedb');
    
    const result = await db.collection('animes').updateOne(
      {
        _id: new ObjectId(params.id),
        userId: session.user?.email,
      },
      {
        $set: {
          title,
          rating,
          episodes,
          imageUrl,
          popularityScore,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      popularityScore 
    });
  } catch (error) {
    console.error('Error updating anime:', error);
    return NextResponse.json(
      { error: 'Failed to update anime' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('animedb');
    
    const result = await db.collection('animes').deleteOne({
      _id: new ObjectId(context.params.id),
      userId: session.user?.email,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Anime not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting anime:', error);
    return NextResponse.json(
      { error: 'Failed to delete anime' },
      { status: 500 }
    );
  }
}
