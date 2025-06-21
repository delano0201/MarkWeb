import redis from '../../lib/redis';

const MAX_REQUESTS = 14;
const WINDOW_SECONDS = 60;
const RATE_LIMIT_KEY = 'shapes_api_rate_limit';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  try {
    // Increment request count in Redis with expiry
    const currentCount = await redis.incr(RATE_LIMIT_KEY);

    if (currentCount === 1) {
      // First request, set expiry for the window
      await redis.expire(RATE_LIMIT_KEY, WINDOW_SECONDS);
    }

    if (currentCount > MAX_REQUESTS) {
      // Calculate TTL remaining for the cooldown window
      const ttl = await redis.ttl(RATE_LIMIT_KEY);

      // Delay request until TTL expires (plus a small buffer 100ms)
      await delay((ttl + 1) * 1000);
      
      // After wait, reset count by starting a new window (atomic)
      // Use Lua script or simply reset key here:
      await redis.set(RATE_LIMIT_KEY, 1, 'EX', WINDOW_SECONDS);
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages' });
    }

    // Call Shapes API
    const response = await fetch('https://api.shapes.inc/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SHAPES_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'shapesinc/mark-u4i9', // Replace with your model
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.message || 'Shapes API error' });
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message;
    return res.status(200).json(aiMessage);

  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
