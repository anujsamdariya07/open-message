import mongoose from 'mongoose';

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

const dbConnect = async (): Promise<void> => {
  if (connection.isConnected) {
    console.log('Database already connected...');
    return;
  }

  console.log(`dbConnect: ${dbConnect}`)
  
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI! || '');
    
    connection.isConnected = connect.connections[0].readyState;
    console.log(`connection.isConnected: ${connection.isConnected}`)

    console.log('DB Connected Successfully!');
  } catch (error) {
    console.log('DB Connection Failed!');
    process.exit(1);
  }
};

export default dbConnect;
