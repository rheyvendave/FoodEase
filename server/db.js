import mongoose from 'mongoose';

let connectionPromise;

export default async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be configured before starting the API.');
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI)
      .then(() => mongoose.connection)
      .catch(error => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
}
