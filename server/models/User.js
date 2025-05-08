const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    trim: true,
  },
  confirmationCodes: {
    type: Map,
    of: {
      code: String,
      expiresAt: Date,
    },
    default: {},
  },
  socialAccounts: {
    linkedin: [
      {
        username: String,
        accountId: String,
        password: String,
        email: String,
        verified: Boolean,
        accessToken: String,
        profileUrl: String,
        profileImage: String,
        connectedAt: Date,
      },
    ],
    twitter: [
      {
        username: String,
        accountId: String,
        password: String,
        email: String,
        verified: Boolean,
        accessToken: String,
        profileUrl: String,
        profileImage: String,
        connectedAt: Date,
      },
    ],
    facebook: [
      {
        username: String,
        accountId: String,
        password: String,
        email: String,
        verified: Boolean,
        accessToken: String,
        profileUrl: String,
        profileImage: String,
        connectedAt: Date,
      },
    ],
    instagram: [
      {
        username: String,
        accountId: String,
        password: String,
        email: String,
        verified: Boolean,
        accessToken: String,
        profileUrl: String,
        profileImage: String,
        connectedAt: Date,
      },
    ],
    youtube: [
      {
        username: String,
        accountId: String,
        password: String,
        email: String,
        verified: Boolean,
        accessToken: String,
        profileUrl: String,
        profileImage: String,
        connectedAt: Date,
      },
    ],
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
}, {
  timestamps: true,
});

// Hash the password before saving
UserSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Generate authentication token
UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const config = require('../config');

  const token = jwt.sign({ _id: user._id.toString() }, config.jwtSecret, {
    expiresIn: '7d',
  });

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

// Generate confirmation code
UserSchema.methods.generateConfirmationCode = async function (type = 'login') {
  const user = this;

  // Generate a random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiration to 10 minutes from now
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  // Store the code in the user's confirmationCodes map
  user.confirmationCodes.set(type, { code, expiresAt });
  await user.save();

  return code;
};

// Verify confirmation code
UserSchema.methods.verifyConfirmationCode = function (type, code) {
  const user = this;

  if (!user.confirmationCodes.has(type)) {
    return false;
  }

  const storedData = user.confirmationCodes.get(type);
  const now = new Date();

  // Check if code is expired
  if (now > storedData.expiresAt) {
    return false;
  }

  return storedData.code === code;
};

// Find user by credentials
UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Invalid login credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid login credentials');
  }

  return user;
};

// Remove sensitive data when converting to JSON
UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.confirmationCodes;

  return userObject;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
