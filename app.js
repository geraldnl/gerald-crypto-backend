const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const walletRoutes = require('./routes/wallet.routes');
const transactionRoutes = require('./routes/transaction.routes');
const swapRoutes = require('./routes/swap.routes');
const marketRoutes = require('./routes/market.routes');
const kycRoutes = require('./routes/kyc.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const cryptoRoutes = require('./routes/crypto.routes');

const { register, login } = require('./controllers/auth.controller');
const { getMe } = require('./controllers/user.controller');
const { protect } = require('./middleware/auth.middleware');
const { validate } = require('./middleware/validate.middleware');
const { body } = require('express-validator');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));


// ================= CORS FIX (IMPORTANT) =================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://visionary-swan-285b19.netlify.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman / server requests
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // IMPORTANT: DO NOT throw error (prevents CORS crash)
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // 🔥 fixes preflight requests


// ================= ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/crypto', cryptoRoutes);


// ================= AUTH SHORTCUT ROUTES =================
app.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
);

app.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  login
);

app.get('/profile', protect, getMe);


// ================= HEALTH CHECK =================
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});


// ================= ERROR HANDLER =================
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

module.exports = app;