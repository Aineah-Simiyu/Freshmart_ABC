import express from 'express';
import session from 'express-session';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { config } from '@core/config';
import { errorHandler } from '@core/middleware';
import { SESSION_NAME, SESSION_MAX_AGE } from '@core/constants';

import authRoutes from '@modules/auth/routes';
import productRoutes from '@modules/products/routes';
import salesRoutes from '@modules/sales/routes';
import reportRoutes from '@modules/reports/routes';

const app = express();

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    name: SESSION_NAME,
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
    },
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'FreshMart API is running' });
});

app.use(errorHandler);

export default app;
