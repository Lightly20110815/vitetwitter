import { kv } from '@vercel/kv';

const POSTS_KEY = 'microblog:posts';

export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // 获取所有帖子
      const posts = await kv.get(POSTS_KEY) || [];
      return res.status(200).json(posts);
    }

    if (req.method === 'POST') {
      // 创建新帖子
      const posts = await kv.get(POSTS_KEY) || [];
      const newPost = req.body;
      posts.unshift(newPost);
      await kv.set(POSTS_KEY, posts);
      return res.status(201).json(newPost);
    }

    if (req.method === 'DELETE') {
      // 删除帖子
      const { id } = req.query;
      const posts = await kv.get(POSTS_KEY) || [];
      const filtered = posts.filter(p => p.id !== id);
      await kv.set(POSTS_KEY, filtered);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}