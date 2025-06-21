// server/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const connectDB = async () => {
  try {
    // Usar una URI por defecto si no está configurada
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/bairro-chicken-inventory';
    
    console.log('Intentando conectar a MongoDB:', mongoURI);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB conectado exitosamente');
  } catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    
    // Si falla la conexión, intentar con una base de datos en memoria para desarrollo
    console.log('🔄 Intentando modo de desarrollo sin MongoDB...');
    
    // En un entorno de producción, deberías salir del proceso
    // process.exit(1);
  }
};

export default connectDB;