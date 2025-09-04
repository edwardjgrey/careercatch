// pages/api/auth/[...nextauth].js - Complete NextAuth endpoint
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import pool from '../../../lib/db'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Get user from database
          const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND is_active = true',
            [credentials.email]
          )

          if (result.rows.length === 0) {
            console.log('User not found:', credentials.email)
            return null
          }

          const user = result.rows[0]

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isPasswordValid) {
            console.log('Invalid password for:', credentials.email)
            return null
          }

          // Get company info if user is employer
          let company = null
          if (user.role === 'employer') {
            const companyResult = await pool.query(
              'SELECT * FROM companies WHERE user_id = $1',
              [user.id]
            )
            if (companyResult.rows.length > 0) {
              company = companyResult.rows[0]
            }
          }

          // Return user object for session
          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            country: user.country,
            city: user.city,
            phone: user.phone,
            avatarUrl: user.avatar_url,
            companyId: company?.id,
            companyName: company?.name,
            companySlug: company?.slug
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.country = user.country
        token.city = user.city
        token.companyId = user.companyId
        token.companyName = user.companyName
        token.companySlug = user.companySlug
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.name = token.name
        session.user.role = token.role
        session.user.firstName = token.firstName
        session.user.lastName = token.lastName
        session.user.country = token.country
        session.user.city = token.city
        session.user.companyId = token.companyId
        session.user.companyName = token.companyName
        session.user.companySlug = token.companySlug
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-development-secret-change-in-production',
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)