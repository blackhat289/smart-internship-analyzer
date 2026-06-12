import app from './app.js';
import env from './config/env.js';
import { connectDB } from './config/db.js';

async function start() {
  await connectDB();
  app.listen(env.port, () => {
    console.log(`Backend running on port ${env.port}`);
    console.log(`Allowed frontend origin base: ${env.clientUrl}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
