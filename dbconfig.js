import 'dotenv/config'; // Carga automática en una sola línea
import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres'});
try {
  await sequelize.authenticate();
  console.log('Conexión establecida con éxito.');
} catch (error) {
  console.error('No se pudo conectar a la base de datos:', error);
}
await sequelize.close();