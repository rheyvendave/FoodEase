import dotenv from 'dotenv';
import app from './app.js';
import connectToDatabase from './db.js';

dotenv.config();

const port = process.env.PORT || 5000;

connectToDatabase()
  .then(() => app.listen(port, () => console.log(`API listening at http://localhost:${port}`)))
  .catch(error => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
