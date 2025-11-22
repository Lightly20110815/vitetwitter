import React, { useState, useEffect } from 'react';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 配置区域 - 可自定义
  const TITLE = "𝕊𝕪'𝕤 𝕋𝕨𝕚𝕥𝕥𝕖𝕣";
  const SUBTITLE = '​🇼​​🇮​​🇹​​🇭​ ​🇾​​🇴​​🇺​,​🇹​​🇭​​🇷​​🇴​​🇺​​🇬​​🇭​ ​🇦​​🇱​​🇱​.';

  // 背景配置
  const BACKGROUND = 'linear-gradient(135deg, #cdb0e3ff 0%, #40c4c4ff 100%)';

  // 字体配置
  const CUSTOM_FONT = 'PingFang SC';
  // 按钮颜色数组
  const BUTTON_COLORS = [
  'bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600',
  'bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600',
  'bg-gradient-to-r from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600',
  'bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600',
  'bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600',
  'bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600',
  'bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600',
  'bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600',
  'bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-500 hover:to-lime-600',
  'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600',
  'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600',
  'bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600',
  'bg-gradient-to-r from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-600',
  'bg-gradient-to-r from-fuchsia-400 to-fuchsia-500 hover:from-fuchsia-500 hover:to-fuchsia-600',
];

  // 按钮文字数组
  const BUTTON_TEXTS = [
    '摸摸你~',
  '喝口水好不好',
  '我一直在这哦',
  '抱一下再走吧',
  '今天也很乖',
  '慢慢来就好',
  '你值得被爱',
  '小心心给你♡',
  '别对自己太凶',
  '休息一下嘛',
  '你已经很棒啦',
  '世界会抱住你的',
  '我在你旁边呢',
  '发光不需要理由',
  '你从来不差',
  '今天也稳稳当当',
  '对自己好一点',
  '给你一口温暖',
  '再靠近我一点？',
  '想你了，怎么办',
  '过来让我看看你',
  '你是为了我点的吗',
  '宝贝，想抱你一下',
  '你怎么这么好亲',
  '我喜欢你这样看我',
  '小声告诉你…我超想你',
  '别走，陪陪我嘛',
  '你点一下我就心软一下',
  '你真的…很容易让我心动',
  '别害羞，我又不会吃掉你',
  '我好像有点上头了',
  '你靠过来，我教你呼吸',
  '想听我说喜欢你吗？',
  '再点一下，我就抱你了',
  '你点到我心上了',
  '你真的…太可爱了宝',
  '再靠近我一点？',
  '想你了，怎么办',
  '过来让我看看你',
  '你是为了我点的吗',
  '宝贝，想抱你一下',
  '你怎么这么好亲',
  '我喜欢你这样看我',
  '小声告诉你…我超想你',
  '别走，陪陪我嘛',
  '你点一下我就心软一下',
  '你真的…很容易让我心动',
  '别害羞，我又不会吃掉你',
  '我好像有点上头了',
  '你靠过来，我教你呼吸',
  '想听我说喜欢你吗？',
  '再点一下，我就抱你了',
  '你点到我心上了',
  '你真的…太可爱了宝'
];

  useEffect(() => {
    loadPosts();
  }, []);

  // 返回顶部按钮显隐
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
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

      // 3. 过滤失败帖子 + 排序（最新在最上）
      const validPosts = postsData.filter(post => post !== null);
      validPosts.sort((a, b) => b.timestamp - a.timestamp);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ ...backgroundStyle, ...fontStyle }}>
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  // ✅ 不看 index、不怕同分钟：只认 timestamp 最大的就是最新
  const latestTimestamp = posts.length
    ? Math.max(...posts.map(p => p.timestamp))
    : null;

  return (
    <div className="min-h-screen flex flex-col relative" style={{ ...backgroundStyle, ...fontStyle }}>
      {/* 呼吸动画 */}
      <style>{`
        @keyframes breatheDot {
          0%, 100% { transform: scale(1); opacity: .85; filter: saturate(1); }
          50% { transform: scale(1.18); opacity: 1; filter: saturate(1.25); }
        }
        .breathe-dot {
          animation: breatheDot 2.2s ease-in-out infinite;
          box-shadow:
            0 0 8px rgba(255,255,255,0.35),
            0 0 16px rgba(120,170,255,0.45);
        }
      `}</style>

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
              const isLatest = post.timestamp === latestTimestamp;

              return (
                <div key={post.id} className="flex gap-4">
                  {/* 左侧时间线 */}
                  <div className="flex flex-col items-center w-24 flex-shrink-0">
                    <div className="text-xs text-gray-600 text-center mb-2 whitespace-nowrap">
                      <div>{timeInfo.line1}</div>
                      <div className="text-gray-500">{timeInfo.line2}</div>
                    </div>

                    {/* 点点：外圈 + 内核 + 呼吸 */}
                    <div className="relative flex items-center justify-center">
                      <div
                        className={[
                          "w-4 h-4 rounded-full shadow-sm breathe-dot",
                          "bg-gradient-to-br from-blue-400 to-purple-500",
                          isLatest ? "ring-4 ring-white/70" : "ring-2 ring-white/35"
                        ].join(" ")}
                      />
                      <div className="absolute w-1.5 h-1.5 rounded-full bg-white/90" />
                    </div>

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
          <p>
            Copyright © 2025{' '}
            <a
              href="https://profile.404yann.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600"
            >
              Sy Yann
            </a>
            {' '} & 萌ICP备20250733号
          </p>
        </div>
      </footer>

      {/* 返回顶部按钮 */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="返回顶部"
          className="fixed bottom-6 right-6 z-50 px-4 py-2 rounded-full bg-white/80 backdrop-blur shadow-lg text-gray-700 text-sm hover:bg-white transition"
        >
          ↑ 返回顶部
        </button>
      )}
    </div>
  );
}
