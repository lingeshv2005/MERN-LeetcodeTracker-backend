// redisClient.js
const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL, // Redis endpoint from ECS environment variable
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis successfully!');
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
})();

module.exports = redisClient;
