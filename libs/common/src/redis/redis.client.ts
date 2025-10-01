import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export async function connectRedis({
  url,
  username,
  password,
}: {
  url: string;
  username?: string;
  password?: string;
}): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({ url, username, password });
    redisClient.on('error', (err) => console.error('Redis Error', err));
    await redisClient.connect();
    console.log('✅ Redis connected');
  }
  return redisClient;
}

export { redisClient };
