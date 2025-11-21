import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'posts.json');

// 确保数据文件存在
function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
}

// 读取帖子
function readPosts() {
  ensureDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

// 写入帖子
function writePosts(posts) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

export default function handler(req, res) {
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
      const posts = readPosts();
      return res.status(200).json(posts);
    }

    if (req.method === 'POST') {
      // 创建新帖子
      const posts = readPosts();
      const newPost = req.body;
      posts.unshift(newPost);
      writePosts(posts);
      return res.status(201).json(newPost);
    }

    if (req.method === 'DELETE') {
      // 删除帖子
      const { id } = req.query;
      const posts = readPosts();
      const filtered = posts.filter(p => p.id !== id);
      writePosts(filtered);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}