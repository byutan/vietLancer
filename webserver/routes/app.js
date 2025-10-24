import express from 'express';
import serveFavicon from 'serve-favicon';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'

import signUpRouter from './api/signup.js'
import signInRouter from './api/signin.js';
import updateProfileRouter from './api/profile.js'
import emailVerify from './api/emailverify.js'
import projectPosting from './api/projectposting.js'

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
const app = express();

app.use(serveFavicon(path.join(__dirName, '../public', 'favicon.ico')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());

app.use('/api', signUpRouter);
app.use('/api', signInRouter);
app.use('/api', updateProfileRouter);
app.use('/api', emailVerify);
app.use('/api', projectPosting);

export default app;