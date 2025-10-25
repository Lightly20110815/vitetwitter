<template>
  <div class="focus-wrapper">
    <div class="focus-timeline">
      <div class="time">
        <div class="clock">{{ timePart }}</div>
        <div class="date">{{ datePart }}</div>
      </div>

      <div
        class="dot"
        :class="{ active: true }"
        @click="$emit('toggleView')"
        title="切换视图"
      ></div>

      <article class="post-card">
        <div class="content" v-html="linkedContent"></div>
      </article>
    </div>

    <!-- 底部的导航箭头与页码 -->
    <div class="focus-nav">
      <button class="nav-btn" @click="$emit('prev')" :disabled="isFirst">▲</button>
      <span class="index">{{ index + 1 }} / {{ total }}</span>
      <button class="nav-btn" @click="$emit('next')" :disabled="isLast">▼</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  post: { type: Object, required: true },
  index: Number,
  total: Number,
  isFirst: Boolean,
  isLast: Boolean,
});

const timePart = computed(() => {
  const d = new Date(props.post.created_at);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
});

const datePart = computed(() => {
  const d = new Date(props.post.created_at);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
});

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
}

const linkedContent = computed(() => {
  const safe = escapeHTML(props.post.content);
  return linkify(safe).replace(/\n/g, "<br/>");
});
</script>

<style scoped>
/* ===== 容器布局 ===== */
.focus-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.focus-timeline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

/* ===== 时间部分 ===== */
.time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  line-height: 1.2;
  text-align: right;
}

.time .clock {
  font-size: 0.95rem;
  font-weight: 600;
}

.time .date {
  font-size: 0.75rem;
  color: var(--muted);
}

/* ===== 圆点部分 ===== */
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--fg);
  margin: 0 0.6rem;
  flex-shrink: 0;
  align-self: center;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    background 0.25s ease;
}

/* hover 呼吸光效 */
.dot:hover {
  transform: scale(1.2);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

/* active 态闪光动画 */
@keyframes dotPulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 16px rgba(255, 255, 255, 0.75);
    transform: scale(1.1);
  }
}
.dot.active {
  animation: dotPulse 2.2s ease-in-out infinite;
}

/* ===== 帖子卡片 ===== */
.post-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 1rem 1.25rem;
  box-shadow: var(--shadow-card);
  max-width: 520px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.35);
}

.post-card .content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 1rem;
  line-height: 1.6;
}

/* ===== 导航按钮 ===== */
.focus-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--muted);
  font-size: 0.75rem;
  gap: 0.4rem;
}

.nav-btn {
  background: none;
  border: none;
  color: var(--fg);
  cursor: pointer;
  font-size: 0.8rem;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.nav-btn:hover {
  transform: scale(1.15);
  opacity: 0.9;
}
.nav-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.index {
  font-size: 0.75rem;
  margin: 0.25rem 0;
  color: var(--muted);
}

/* ===== 响应式 ===== */
@media (max-width: 600px) {
  .focus-timeline {
    flex-direction: column;
    gap: 0.75rem;
  }
  .time {
    align-items: center;
  }
  .dot {
    margin: 0;
  }
  .post-card {
    max-width: 90%;
  }
}
</style>
