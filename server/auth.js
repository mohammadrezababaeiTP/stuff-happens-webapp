// Import passport and its local strategy
import passport from 'passport';
import LocalStrategy from 'passport-local';

// Import user validation functions
import { validateUser, getUserById } from './userDao.js'; // ✅ corrected import path


// Configure the local login strategy
passport.use(new LocalStrategy(function verify(username, password, cb) {
  const user = validateUser(username, password); // Validate credentials
  if (!user) return cb(null, false, 'Incorrect credentials.'); // Fail if not valid
  return cb(null, user); // Success: return user object
}));

// Save user ID in session
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

// Retrieve user information from session by ID
passport.deserializeUser((id, cb) => {
  const user = getUserById(id); // Use helper instead of inline query
  if (!user) return cb(null, false);
  cb(null, user);
});

// Export configured passport instance
export default passport;
