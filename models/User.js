const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Password is required ONLY for local accounts
    password: {
      type: String,
      // not "required: true" anymore – OAuth users may not have one
    },
    // New fields for OAuth
    provider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },
    providerId: {
      type: String, // Google/GitHub profile.id
    },
    avatar: {
      type: String, // profile picture URL if available
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before save (only if password exists)
userSchema.pre('save', async function (next) {
  // if password field isn't modified OR doesn't exist → skip
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password (for local users)
userSchema.methods.matchPassword = function (enteredPassword) {
  // if user has no password (OAuth-only account), always fail
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
