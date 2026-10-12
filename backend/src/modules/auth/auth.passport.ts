import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '@/config/env';
import { OAuthProfile } from './auth.types';

passport.use(
    new GoogleStrategy(
        {
            clientID: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            callbackURL: env.GOOGLE_REDIRECT_URI,
        },
        (_accessToken, _refreshToken, profile, done) => {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(null, false); // No internal error but data coudn't be retrieved so it triggers failureRedirect
            
            const firstName = profile.name?.givenName ?? profile.displayName;
            if (!firstName) return done(null, false);

            const normalized: OAuthProfile = {
                provider: 'google',
                providerId: profile.id,
                email,
                firstName,
                lastName: profile.name?.familyName,
                avatarUrl: profile.photos?.[0]?.value ?? null,
            };

            done(null, normalized as unknown as Express.User);
        }
    )
);

export default passport;