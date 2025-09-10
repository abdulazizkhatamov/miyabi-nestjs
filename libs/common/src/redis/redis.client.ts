import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function connectRedis({
  url,
  username,
  password,
}: {
  url: string;
  username?: string;
  password?: string;
}) {
  if (!redisClient) {
    redisClient = createClient({ url, username, password });
    redisClient.on('error', (err) => console.error('Redis Error', err));
    await redisClient.connect();
    console.log('✅ Redis connected');
  }
  return redisClient;
}

export { redisClient };
