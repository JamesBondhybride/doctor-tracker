import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax', // Required for Next.js rewrite proxy
    path: '/',       // Ensures cookie is sent on all /api routes
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

const sendTokenCookie = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.cookie('token', token, getCookieOptions());

  res.status(statusCode).json({
    success: true,
    token, // Included as fallback in case browser blocks cookies
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    sendTokenCookie(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.cookie('token', '', {
    ...getCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};
