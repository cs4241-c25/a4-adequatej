import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const client = await clientPromise;
          const db = client.db('animedb');
          
          try {
            await db.collection('users').dropIndex('username_1');
          } catch {
            // ignores error if index doesn't exist bc yuh
          }

          const users = db.collection('users');
          const user = await users.findOne({ email: credentials?.email });

          if (!user) {
            const hashedPassword = await bcrypt.hash(credentials?.password || '', 10);
            const newUser = await users.insertOne({
              email: credentials?.email,
              password: hashedPassword,
              createdAt: new Date()
            });
            return { 
              id: newUser.insertedId.toString(), 
              email: credentials?.email 
            };
          }

          const isValid = await bcrypt.compare(
            credentials?.password || '',
            user.password
          );

          if (!isValid) {
            throw new Error('Invalid credentials');
          }

          return { 
            id: user._id.toString(), 
            email: user.email 
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    })
  ]
};