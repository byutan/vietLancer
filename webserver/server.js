import dotenv from "dotenv";
dotenv.config();
import app from './routes/app.js'
app.listen(process.env.port, function () {
    console.log('Your app running on port ' + process.env.port);
})