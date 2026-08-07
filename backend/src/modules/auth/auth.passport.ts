import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from '@/config/env';

passport.use(
    new GoogleStrategy(
        {
            clientID: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            callbackURL: env.GOOGLE_REDIRECT_URI,
        },
        (_accessToken, _refreshToken, profile, done) => {
            done(null, profile as unknown as Express.User);
        }
    )
);

export default passport;