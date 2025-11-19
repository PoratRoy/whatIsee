import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import dbConnect from './mongodb';
import User from '../models/schema/User';

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await dbConnect();
          
          // Check if user already exists
          const existingUser = await User.findOne({
            'googleCredentials.googleId': account.providerAccountId,
          });

          if (!existingUser) {
            // Create new user in our custom User model
            const newUser = new User({
              name: user.name || profile?.name,
              googleCredentials: {
                googleId: account.providerAccountId,
                email: user.email!,
                name: user.name || profile?.name,
                picture: user.image || profile?.picture,
              },
              movies: [],
              series: [],
              categories: [],
            });

            await newUser.save();
          }

          return true;
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      return false;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          await dbConnect();
          const user = await User.findOne({
            'googleCredentials.email': session.user.email,
          });

          if (user) {
            session.user.id = user._id.toString();
            session.user.googleId = user.googleCredentials.googleId;
          }
        } catch (error) {
          console.error('Error fetching user session:', error);
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.googleId = account.providerAccountId;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
