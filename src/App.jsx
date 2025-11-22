import React, { useState, useEffect } from 'react';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // 配置区域 - 可自定义
  const TITLE = '我的推博';
  const SUBTITLE = '记录生活点滴';
  
  // 背景配置
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
      // 1. 读取帖子列表
      const indexResponse = await fetch('/posts.txt');
      if (!indexResponse.ok) {
        throw new Error('无法加载帖子列表');
      }
      
      const indexText = await indexResponse.text();
      const fileNames = indexText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#')); // 过滤空行和注释

      // 2. 并发读取所有帖子内容
      const postsData = await Promise.all(
        fileNames.map(async (fileName) => {
          try {
            const response = await fetch(`/${fileName}`);
            if (!response.ok) {
              console.error(`无法加载 ${fileName}`);
              return null;
            }
            
            const content = await response.text();
            
            // 从文件名解析时间戳
            const year = parseInt(fileName.substring(0, 4));
            const month = parseInt(fileName.substring(4, 6));
            const day = parseInt(fileName.substring(6, 8));
            const hour = parseInt(fileName.substring(8, 10));
            const minute = parseInt(fileName.substring(10, 12));
            const second = parseInt(fileName.substring(12, 14));
            
            const timestamp = new Date(year, month - 1, day, hour, minute, second).getTime();

            return {
              id: fileName,
              content: content.trim(),
              author: 'Sy Yann',
              timestamp
            };
          } catch (error) {
            console.error(`读取 ${fileName} 失败:`, error);
            return null;
          }
        })
      );

      // 3. 过滤掉失败的帖子并设置状态
      const validPosts = postsData.filter(post => post !== null);
      setPosts(validPosts);
      
    } catch (error) {
      console.error('加载帖子失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    setCurrentColorIndex((currentColorIndex + 1) % BUTTON_COLORS.length);
    setCurrentTextIndex((currentTextIndex + 1) % BUTTON_TEXTS.length);
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
                    <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-sm p-6 relative">
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