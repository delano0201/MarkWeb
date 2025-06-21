export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' });
  }

  try {
    const response = await fetch('https://api.shapes.inc/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SHAPES_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'shapesinc/mark-u4i9', // REPLACE with your Shapes username/model
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.message || 'Shapes API error' });
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message;
    res.status(200).json(aiMessage);

  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
