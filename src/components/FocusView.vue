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

    <div class="focus-nav">
      <span class="index">{{ index + 1 }} / {{ total }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  post: { type: Object, required: true },
  index: { type: Number, required: true },
  total: { type: Number, required: true },
  isFirst: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
});

defineEmits(["toggleView"]); // 这里只发 toggleView，next/prev 已经移到 App.vue 控制

/* ========== 时间部分 ========== */
const timePart = computed(() => {
  const d = new Date(props.post.created_at);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
});

const datePart = computed(() => {
  const d = new Date(props.post.created_at);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  )}/${d.getFullYear()}`;
});

/* ========== 内容渲染 ========== */
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`
  );
}

const linkedContent = computed(() => {
  const safe = escapeHTML(props.post.content || "");
  return linkify(safe).replace(/\n/g, "<br/>");
});
</script>

<style scoped>
.focus-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  user-select: none;
}

/* 时间线布局 */
.focus-timeline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

/* 时间区域 */
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

/* 白色小圆点 */
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
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}
.dot:hover {
  transform: scale(1.2);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

/* 白点闪动动画 */
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

/* 帖子卡片样式 */
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
  box-shadow: 0 12px 24px -8px rgba(0,0,0,0.35);
}
.post-card .content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 1rem;
  line-height: 1.6;
}
.post-card a {
  color: var(--fg);
  text-decoration: underline;
}

/* 底部计数文字 */
.focus-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--muted);
  font-size: 0.75rem;
  gap: 0.4rem;
}
.index {
  font-size: 0.75rem;
  margin: 0.25rem 0;
  color: var(--muted);
}

/* 移动端自适应 */
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
