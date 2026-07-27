import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please add a full name'],
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
      index: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      select: false,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'owner', 'admin'],
      default: 'customer',
    },
    mobile: {
      type: String,
    },
    phone: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    verificationOTP: String,
    verificationOTPExpires: Date,
    resetPasswordOTP: String,
    resetPasswordOTPExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Synchronize properties in pre-save hook
userSchema.pre('save', async function (next) {
  // Sync names
  if (this.isModified('fullName')) {
    this.name = this.fullName;
  } else if (this.isModified('name') && !this.fullName) {
    this.fullName = this.name;
  }

  // Sync phones
  if (this.isModified('mobile')) {
    this.phone = this.mobile;
  } else if (this.isModified('phone') && !this.mobile) {
    this.mobile = this.phone;
  }

  // Sync profile images
  if (this.isModified('profileImage')) {
    this.profilePicture = this.profileImage;
  } else if (this.isModified('profilePicture') && !this.profileImage) {
    this.profileImage = this.profilePicture;
  }

  // Sync verification status
  if (this.isModified('emailVerified')) {
    this.isVerified = this.emailVerified;
  } else if (this.isModified('isVerified')) {
    this.emailVerified = this.isVerified;
  }

  // Sync and hash password
  if (this.isModified('passwordHash') && this.passwordHash) {
    if (!this.passwordHash.startsWith('$2a$') && !this.passwordHash.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    }
    this.password = this.passwordHash;
  } else if (this.isModified('password') && this.password) {
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    this.passwordHash = this.password;
  }

  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password || this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
