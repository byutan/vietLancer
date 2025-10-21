import express from 'express';
import serveFavicon from 'serve-favicon';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors'

import signUpRouter from './api/signup.js'
import signInRouter from './api/signin.js';

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
const app = express();

app.use(serveFavicon(path.join(__dirName, '../public', 'favicon.ico')));
app.use(express.json());
app.use(cors());

app.use('/api', signUpRouter);
app.use('/api', signInRouter);

export default app;