import React, { useState, useEffect } from 'react';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 配置区域 - 可自定义
  const ADMIN_PASSWORD = 'your_password_here';
  const TITLE = '我的推博';
  const SUBTITLE = '记录生活点滴';
  const AUTHOR_NAME = 'Sy Yann';
  
  // 背景配置 - 可以是颜色、渐变、或图片URL
  const BACKGROUND = 'linear-gradient(135deg, #cdb0e3ff 0%, #40c4c4ff 100%)';
  
  // 字体配置
  const CUSTOM_FONT = 'PingFang SC';
  
  // 按钮颜色数组
  const BUTTON_COLORS = [
    'bg-blue-500 hover:bg-blue-600',
    'bg-pink-500 hover:bg-pink-600',
    'bg-purple-500 hover:bg-purple-600',
    'bg-green-500 hover:bg-green-600',
    'bg-orange-500 hover:bg-orange-600',
    'bg-red-500 hover:bg-red-600',
    'bg-indigo-500 hover:bg-indigo-600',
    'bg-teal-500 hover:bg-teal-600',
  ];
  
  // 按钮文字数组
  const BUTTON_TEXTS = [
    'Hello~',
    '天天开心呀',
    '要笑口常开哦',
    '今天也要加油',
    '保持好心情',
    '生活很美好',
    '开心每一天',
    '你很棒',
    '继续努力',
    '相信自己',
    '明天会更好',
    '享受当下',
    '做最好的自己',
    '保持热爱',
    '勇敢前行'
  ];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      // 优先从localStorage加载（开发环境）
      const saved = localStorage.getItem('microblog_posts');
      if (saved) {
        setPosts(JSON.parse(saved));
      }
      
      // 尝试从API加载（生产环境）
      try {
        const response = await fetch('/api/posts');
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
          // 同步到localStorage
          localStorage.setItem('microblog_posts', JSON.stringify(data));
        }
      } catch (apiError) {
        // API不可用时，继续使用localStorage的数据
        console.log('使用本地存储');
      }
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 15) {
      setShowAuthModal(true);
      setClickCount(0);
    } else {
      setCurrentColorIndex((currentColorIndex + 1) % BUTTON_COLORS.length);
      setCurrentTextIndex((currentTextIndex + 1) % BUTTON_TEXTS.length);
    }
  };

  const handleAuth = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuth(true);
      setShowAuthModal(false);
      setPassword('');
    } else {
      alert('密码错误');
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;

    const post = {
      id: Date.now().toString(),
      content: newPost,
      author: AUTHOR_NAME,
      timestamp: Date.now()
    };

    // 先更新本地状态和localStorage
    const updated = [post, ...posts];
    setPosts(updated);
    setNewPost('');
    localStorage.setItem('microblog_posts', JSON.stringify(updated));

    // 尝试同步到API
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });

      if (!response.ok) {
        console.log('API同步失败，已保存到本地');
      }
    } catch (error) {
      console.log('API不可用，已保存到本地');
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('确定要删除这条帖子吗？')) return;

    // 先更新本地状态和localStorage
    const filtered = posts.filter(p => p.id !== postId);
    setPosts(filtered);
    localStorage.setItem('microblog_posts', JSON.stringify(filtered));

    // 尝试同步到API
    try {
      const response = await fetch(`/api/posts?id=${postId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        console.log('API同步失败，已从本地删除');
      }
    } catch (error) {
      console.log('API不可用，已从本地删除');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    // 第一行：Y-M-D HH:MM
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    
    let line1 = '';
    if (years > 0) {
      line1 = `${year}-${month}-${day} ${hour}:${minute}`;
    } else if (months > 0 || days > 0) {
      line1 = `${month}-${day} ${hour}:${minute}`;
    } else {
      line1 = `${hour}:${minute}`;
    }
    
    // 第二行：相对时间
    let line2 = '';
    if (years > 0) {
      line2 = `${years}年`;
      if (months % 12 > 0) line2 += `${months % 12}月`;
      if (days % 30 > 0) line2 += `${days % 30}日`;
      line2 += ' 前';
    } else if (months > 0) {
      line2 = `${months}月`;
      if (days % 30 > 0) line2 += `${days % 30}日`;
      line2 += ' 前';
    } else if (days > 0) {
      line2 = `${days}日 `;
      if (hours % 24 > 0) line2 += `${hours % 24}小时`;
      line2 += '前';
    } else if (hours > 0) {
      line2 = `${hours}小时前`;
    } else if (minutes > 0) {
      line2 = `${minutes}分钟前`;
    } else {
      line2 = '现在';
    }
    
    return { line1, line2 };
  };

  const backgroundStyle = BACKGROUND.startsWith('url(') 
    ? { backgroundImage: BACKGROUND, backgroundSize: 'cover', backgroundPosition: 'center' }
    : BACKGROUND.startsWith('linear-gradient')
    ? { background: BACKGROUND }
    : { backgroundColor: BACKGROUND };

  const fontStyle = CUSTOM_FONT ? { fontFamily: CUSTOM_FONT } : {};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{...backgroundStyle, ...fontStyle}}>
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{...backgroundStyle, ...fontStyle}}>
      <div className="flex-1 max-w-3xl mx-auto py-8 px-4 w-full">
        {/* 头部 */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{TITLE}</h1>
            <p className="text-gray-600">{SUBTITLE}</p>
          </div>
          <button
            onClick={handleButtonClick}
            className={`px-6 py-2 text-white rounded-lg transition-colors ${BUTTON_COLORS[currentColorIndex]}`}
          >
            {BUTTON_TEXTS[currentTextIndex]}
          </button>
        </div>

        {/* 认证弹窗 */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80">
              <h2 className="text-xl font-bold mb-4">输入管理密码</h2>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="密码"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAuth}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  确认
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    setPassword('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 发帖框 - 只在认证后显示 */}
        {isAuth && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="分享新鲜事..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handlePost();
                }
              }}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-400">
                {newPost.length} 字符
              </span>
              <button
                onClick={handlePost}
                disabled={!newPost.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                发布
              </button>
            </div>
          </div>
        )}

        {/* 帖子列表 - 时间线样式 */}
        <div className="space-y-0">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-400">
              还没有帖子
            </div>
          ) : (
            posts.map((post, index) => {
              const timeInfo = formatTime(post.timestamp);
              return (
                <div key={post.id} className="flex gap-4">
                  {/* 左侧时间线 */}
                  <div className="flex flex-col items-center w-24 flex-shrink-0">
                    <div className="text-xs text-gray-600 text-center mb-2 whitespace-nowrap">
                      <div>{timeInfo.line1}</div>
                      <div className="text-gray-500">{timeInfo.line2}</div>
                    </div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    {index < posts.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-300 mt-2 min-h-[60px]"></div>
                    )}
                  </div>

                  {/* 右侧内容 */}
                  <div className="flex-1 pb-8">
                    <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-sm p-6">
                      {isAuth && (
                        <div className="flex justify-end mb-3">
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-gray-400 hover:text-red-500 text-sm"
                          >
                            删除
                          </button>
                        </div>
                      )}
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 页脚 */}
      <footer className="py-4 text-center text-xs text-gray-600 bg-white bg-opacity-50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4">
          <p>Copyright © 2025 Sy Yann & 萌ICP备20250733号</p>
        </div>
      </footer>
    </div>
  );
}