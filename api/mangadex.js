export default async function handler(req, res) {
  const { path } = req.query;
  const endpoint = path || req.url.replace(/^\/api\/mangadex\??(path=)?/, '');
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const upstream = await fetch(`https://api.mangadex.org${cleanPath}`, {
      headers: {
        'User-Agent': 'MangakyoEditorial/2.0 (contact@mangakyo.app)',
        'Accept': 'application/json',
      },
    });

    const data = await upstream.text();
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.status(upstream.status).send(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
