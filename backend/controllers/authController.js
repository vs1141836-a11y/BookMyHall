import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const MOCK_DB_PATH = path.resolve('mock_db.json');

const readMockDB = () => {
  try {
    if (fs.existsSync(MOCK_DB_PATH)) {
      return JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading mock DB:', err);
  }
  return { users: [] };
};

const writeMockDB = (data) => {
  try {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing mock DB:', err);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Validate inputs explicitly to prevent NoSQL Injection and bad data
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your full name.' });
    }
    if (!/^[a-zA-Z\s]+$/.test(fullName.trim())) {
      return res.status(400).json({ success: false, message: 'Full name must contain only letters and spaces.' });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your email.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your phone number.' });
    }
    if (!/^\d{10,12}$/.test(phone.trim())) {
      return res.status(400).json({ success: false, message: 'Phone number must contain 10 to 12 digits.' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please enter your password.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must contain at least 8 characters.' });
    }

    // Sandbox bypass if database is disconnected/offline
    if (mongoose.connection.readyState !== 1) {
      console.log(`[Sandbox Mode] Registering offline user: ${fullName}`);
      const mockDB = readMockDB();
      
      const userExists = mockDB.users.find(u => u.email === cleanEmail);
      if (userExists) {
        return res.status(400).json({ success: false, message: 'This email is already registered. Please log in.' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: `sandbox_user_${Date.now()}`,
        fullName: fullName.trim(),
        name: fullName.trim(),
        email: cleanEmail,
        passwordHash: hashedPassword,
        phone: phone.trim(),
        mobile: phone.trim(),
        role: 'customer',
        emailVerified: true,
        isVerified: true
      };

      mockDB.users.push(newUser);
      writeMockDB(mockDB);

      return res.status(201).json({
        success: true,
        _id: newUser._id,
        name: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        isVerified: true,
        token: generateToken(newUser._id)
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'This email is already registered. Please log in.' });
    }

    // Create user
    const user = await User.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash: password, // will be auto-hashed by pre-save hook
      role: 'customer',
      mobile: phone.trim(),
      phone: phone.trim(),
      emailVerified: true,
      isVerified: true
    });

    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.fullName || user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || user.mobile,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please enter your email and password.' });
    }

    email = email.trim().toLowerCase();

    // Sandbox bypass if database is disconnected/offline
    if (mongoose.connection.readyState !== 1) {
      console.log(`[Sandbox Mode] Logging in offline user: ${email}`);
      const mockDB = readMockDB();

      const user = mockDB.users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Account not found. Please create an account.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
      }

      return res.json({
        success: true,
        _id: user._id,
        name: user.fullName || user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || user.mobile,
        isVerified: true,
        token: generateToken(user._id)
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password +passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Account not found. Please create an account.' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    // Track last login time
    user.lastLogin = Date.now();
    await user.save();

    res.json({
      success: true,
      _id: user._id,
      name: user.fullName || user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || user.mobile,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const user = mockDB.users.find(u => u._id === req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({
        success: true,
        data: user,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const userIdx = mockDB.users.findIndex(u => u._id === req.user._id);
      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      const user = mockDB.users[userIdx];
      user.fullName = req.body.name || user.fullName;
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.mobile = req.body.phone || user.mobile;
      
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(req.body.password, salt);
      }
      
      mockDB.users[userIdx] = user;
      writeMockDB(mockDB);

      return res.json({
        success: true,
        _id: user._id,
        name: user.fullName || user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || user.mobile,
        isVerified: true,
        token: generateToken(user._id),
      });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      if (req.body.profilePicture) {
        user.profilePicture = req.body.profilePicture;
      }
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        profilePicture: updatedUser.profilePicture,
        isVerified: updatedUser.isVerified,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const sendResetEmail = async (toEmail, name, resetUrl) => {
  const message = `
    <div style="font-family: sans-serif; padding: 30px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <h2 style="color: #6366f1; text-align: center; font-size: 24px; font-weight: 800; margin-bottom: 20px;">BookMyHall Password Reset</h2>
      <p style="font-size: 16px; color: #334155;">Hello <strong>${name}</strong>,</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.6;">We received a request to reset your password for your BookMyHall account. If you requested this reset, click the button below to secure a new password:</p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${resetUrl}" style="background-color: #6366f1; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);">Reset My Password</a>
      </div>
      <p style="font-size: 13px; color: #64748b; line-height: 1.6;">This password reset link is valid for <strong>15 minutes</strong> and can only be used once. If you did not make this request, you can safely ignore this email; your password will remain unchanged.</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.4;">This is an automated operational message from BookMyHall Support. Please do not reply directly to this address.</p>
    </div>
  `;

  let transporterConfig = {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER || 'mock',
      pass: process.env.SMTP_PASS || 'mock',
    },
  };

  let isEthereal = false;
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'mock') {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporterConfig = {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      };
      isEthereal = true;
    } catch (err) {
      console.warn('Could not generate Ethereal SMTP account:', err.message);
    }
  }

  const transporter = nodemailer.createTransport(transporterConfig);

  const info = await transporter.sendMail({
    from: `"${process.env.FROM_NAME || 'BookMyHall Support'}" <${process.env.FROM_EMAIL || 'support@bookmyhall.com'}>`,
    to: toEmail,
    subject: 'BookMyHall - Password Reset Request',
    html: message,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (isEthereal && previewUrl) {
    console.log(`[Ethereal Mailer] Reset email sent! Preview URL: ${previewUrl}`);
    return { success: true, previewUrl };
  }

  return { success: true };
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }
    const cleanEmail = email.trim().toLowerCase();

    // Check offline mode
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const userIdx = mockDB.users.findIndex(u => u.email === cleanEmail);
      if (userIdx === -1) {
        return res.status(404).json({ success: false, message: 'There is no user with that email' });
      }

      const resetToken = crypto.randomBytes(20).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      mockDB.users[userIdx].resetPasswordToken = hashedToken;
      mockDB.users[userIdx].resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins expiry
      writeMockDB(mockDB);

      const frontendHost = req.get('host').includes('5000') ? req.get('host').replace('5000', '5173') : req.get('host');
      const resetUrl = `${req.protocol}://${frontendHost}/reset-password/${resetToken}`;

      try {
        const mailRes = await sendResetEmail(cleanEmail, mockDB.users[userIdx].fullName, resetUrl);
        return res.status(200).json({
          success: true,
          message: 'Email sent successfully',
          resetUrl,
          previewUrl: mailRes.previewUrl
        });
      } catch (err) {
        console.error('Email could not be sent in sandbox:', err);
        return res.status(200).json({
          success: true,
          message: 'Mail delivery failed. Reset URL provided directly for testing.',
          resetUrl
        });
      }
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'There is no user with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (15 minutes)
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const frontendHost = req.get('host').includes('5000') ? req.get('host').replace('5000', '5173') : req.get('host');
    const resetUrl = `${req.protocol}://${frontendHost}/reset-password/${resetToken}`;

    try {
      const mailRes = await sendResetEmail(user.email, user.fullName, resetUrl);
      res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        resetUrl,
        previewUrl: mailRes.previewUrl
      });
    } catch (err) {
      console.error('Email could not be sent:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Mail delivery failed. Reset URL provided directly for testing.',
        resetUrl
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must contain at least 8 characters.' });
    }

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Check offline mode
    if (mongoose.connection.readyState !== 1) {
      const mockDB = readMockDB();
      const userIdx = mockDB.users.findIndex(u => 
        u.resetPasswordToken === resetPasswordToken && 
        u.resetPasswordExpire > Date.now()
      );

      if (userIdx === -1) {
        return res.status(400).json({ success: false, message: 'Invalid token or expired token' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      mockDB.users[userIdx].passwordHash = hashedPassword;
      mockDB.users[userIdx].resetPasswordToken = undefined;
      mockDB.users[userIdx].resetPasswordExpire = undefined;
      writeMockDB(mockDB);

      return res.status(200).json({
        success: true,
        message: 'Password reset successful! You can now log in with your new password.',
      });
    }

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token or expired token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};


