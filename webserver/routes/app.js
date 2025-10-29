import express from 'express';
import serveFavicon from 'serve-favicon';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'
import notificationRoutes from './api/notification.js';
import signUpRouter from './api/signup.js'
import signInRouter from './api/signin.js';
import updateProfileRouter from './api/profile.js'
import emailVerify from './api/emailverify.js'
import projectPosting from './api/projectposting.js'
import contractRoutes from './api/contract.js'; 
import uploadRoute from "./api/uploadRoute.js";
import approveRouter from './api/approve_request.js';
import rejectRouter from './api/reject_request.js';
import bidRouter from './api/bid.js';


const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
const app = express();

app.use(serveFavicon(path.join(__dirName, '../public', 'favicon.ico')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use('/api', uploadRoute);
app.use('/api', signUpRouter);
app.use('/api', signInRouter);
app.use('/api', updateProfileRouter);
app.use('/api', emailVerify);
app.use('/api', projectPosting);
app.use('/api/contract', contractRoutes);
app.use('/api/approve', approveRouter);
app.use('/api/reject', rejectRouter);
// app.use('/api/accept', acceptRouter);
app.use('/api', bidRouter);
app.use('/api/notifications', notificationRoutes);
export default app;