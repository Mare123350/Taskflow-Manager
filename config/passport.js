const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

module.exports = function (passport) {
  // ===== LOCAL STRATEGY (email + password) =====
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email.toLowerCase() });
          if (!user) {
            return done(null, false, { message: 'No account with that email' });
          }

          const isMatch = await user.matchPassword(password);
          if (!isMatch) {
            return done(null, false, { message: 'Incorrect password' });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // ===== GOOGLE STRATEGY =====
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL, // e.g. 'http://localhost:3000/auth/google/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find existing user by provider + providerId
          let user = await User.findOne({
            provider: 'google',
            providerId: profile.id,
          });

          // Optionally: link by email if already registered locally
          if (!user && profile.emails && profile.emails.length > 0) {
            user = await User.findOne({ email: profile.emails[0].value });
          }

          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email: profile.emails?.[0]?.value,
              provider: 'google',
              providerId: profile.id,
              avatar: profile.photos?.[0]?.value,
            });
          } else {
            // make sure provider fields exist
            if (!user.provider) user.provider = 'google';
            if (!user.providerId) user.providerId = profile.id;
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  // ===== GITHUB STRATEGY =====
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL, // e.g. 'http://localhost:3000/auth/github/callback'
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            provider: 'github',
            providerId: profile.id,
          });

          // GitHub sometimes doesn’t return email in the main profile; GitHub strategy can be configured to fetch it
          const email =
            profile.emails && profile.emails.length > 0
              ? profile.emails[0].value
              : undefined;

          if (!user && email) {
            user = await User.findOne({ email });
          }

          if (!user) {
            user = await User.create({
              name: profile.displayName || profile.username,
              email,
              provider: 'github',
              providerId: profile.id,
              avatar: profile.photos?.[0]?.value,
            });
          } else {
            if (!user.provider) user.provider = 'github';
            if (!user.providerId) user.providerId = profile.id;
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  // ===== SESSION HANDLING (same as you had) =====
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
