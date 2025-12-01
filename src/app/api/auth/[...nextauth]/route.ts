import NextAuth, { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

// Define allowed domains. Leave empty to allow all (if relying on Azure Single Tenant).
// If you use "Multitenant" in Azure, you MUST set this to your domain (e.g., "arkadasozelegitim.com").
const ALLOWED_DOMAINS: string[] = []; 

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID, // Use specific Tenant ID for Single Tenant, or "common" for Multitenant
      authorization: {
        params: {
          scope: "openid profile email User.Read Files.ReadWrite.All offline_access",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // 1. If we have a list of allowed domains, check the user's email
      if (ALLOWED_DOMAINS.length > 0 && user.email) {
        const emailDomain = user.email.split('@')[1];
        if (!ALLOWED_DOMAINS.includes(emailDomain)) {
          console.log(`Access denied for email: ${user.email}`);
          return false; // Reject login
        }
      }
      
      // 2. (Optional) Check if user exists in Strapi
      // const strapiUser = await fetchStrapiUser(user.email);
      // if (!strapiUser) return false;

      return true;
    },
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin', // Custom sign-in page (we'll create this)
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
