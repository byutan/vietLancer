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
import projectsRouter from './api/project.js';
import contractRoutes from './api/contract.js'; 
import uploadRoute from "./api/uploadRoute.js";
import approveRouter from './api/approve_request.js';
import rejectRouter from './api/reject_request.js';
import bidRouter from './api/bid.js';
import skillRouter from './api/skill.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(serveFavicon(path.join(__dirname, '../public', 'favicon.ico')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
    origin: '*', // Tạm thời để '*' cho dễ, sau khi có link frontend thì dán link vào đây để bảo mật hơn
    credentials: true
}));

// 2. Phục vụ thư mục uploads (để xem file templates)
// Dòng này rất quan trọng để link kiểu domain.com/uploads/template_1.docx hoạt động
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', uploadRoute);
app.use('/api', signUpRouter);
app.use('/api', signInRouter);
app.use('/api', updateProfileRouter);
app.use('/api', emailVerify);
app.use('/api', projectsRouter);
app.use('/api/contract', contractRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use('/api/approve', approveRouter);
app.use('/api/reject', rejectRouter);
// app.use('/api/accept', acceptRouter);
app.use('/api', bidRouter);
app.use('/api/notifications', notificationRoutes);
app.use('/api', skillRouter);
export default app;