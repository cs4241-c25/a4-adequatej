import NextAuth from 'next-auth';
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
            // ingnores error if index doesn't exist
          }

          const users = db.collection('users');

          const user = await users.findOne({ email: credentials?.email });
          console.log('Login attempt for:', credentials?.email);

          if (!user) {
            console.log('Creating new user:', credentials?.email);
            const hashedPassword = await bcrypt.hash(credentials?.password || '', 10);
            const newUser = await users.insertOne({
              email: credentials?.email,
              password: hashedPassword,
              createdAt: new Date()
            });
            console.log('New user created with ID:', newUser.insertedId);
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
            console.log('Invalid password for:', credentials?.email);
            throw new Error('Invalid credentials');
          }

          console.log('Successful login for:', credentials?.email);
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
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
