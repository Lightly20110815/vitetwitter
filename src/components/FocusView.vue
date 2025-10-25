<template>
  <div class="focus-layout">
    <!-- 左侧：时间 + 控制 -->
    <div class="focus-left">
      <!-- 点击时间块 => 切换到 timeline 视图 -->
      <div class="focus-time" @click="toggleView" title="点击切换成时间线视图">
        <div class="focus-hm">{{ hhmm }}</div>
        <div class="focus-date">{{ mmddyyyy }}</div>
      </div>

      <!-- 上/下切换按钮 -->
      <div class="focus-nav">
        <button @click="goNext" :disabled="index === 0">▲</button>
        <div class="dot"></div>
        <button @click="goPrev" :disabled="index === total - 1">▼</button>
        <div class="idx-info">{{ index + 1 }} / {{ total }}</div>
      </div>
    </div>

    <!-- 右侧：当前这条贴子的内容 -->
    <div class="focus-card">
      <article class="post-card focus-card-inner">
        <div class="content" v-html="linkedContent"></div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  post: { type: Object, required: true },
  index: { type: Number, required: true },
  total: { type: Number, required: true }
});

const emit = defineEmits(["prev", "next", "toggleView"]);

function toggleView() {
  emit("toggleView");
}
function goPrev() {
  emit("prev");
}
function goNext() {
  emit("next");
}

// === 时间格式化 ===
function parseParts(iso) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const m2 = String(d.getMinutes()).padStart(2, "0");
  return {
    hhmm: `${hh}:${m2}`,
    mmddyyyy: `${mm}/${dd}/${yyyy}`
  };
}

const hhmm = computed(() => parseParts(props.post.created_at).hhmm);
const mmddyyyy = computed(() => parseParts(props.post.created_at).mmddyyyy);

// === 内容渲染 (转义 + 链接 + 换行) ===
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const linkedContent = computed(() => {
  const raw = props.post.content || "";
  const safe = escapeHTML(raw);

  // 识别 URL
  const withLinks = safe.replace(/(https?:\/\/[^\s]+)/g, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener">${url}</a>`;
  });

  // 换行变成 <br/>
  return withLinks.replace(/\n/g, "<br/>");
});
</script>

<style scoped>
.focus-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 1rem;
  align-items: flex-start;
}

.focus-left {
  min-width: 7rem;
  color: var(--muted);
  font-size: 0.8rem;
  user-select: none;
}

.focus-time {
  text-align: center;
  cursor: pointer;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}
.focus-hm {
  font-size: 1rem;
  font-weight: 500;
  color: var(--fg);
}
.focus-date {
  font-size: 0.8rem;
  color: var(--muted);
}

.focus-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--fg);
}

.focus-nav button {
  background: none;
  border: none;
  color: var(--fg);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.3rem;
  transition: 0.2s;
}
.focus-nav button:hover:not(:disabled) {
  transform: scale(1.2);
}
.focus-nav button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background-color: var(--fg);
  margin: 6px 0;
  box-shadow: 0 0 10px rgba(0,0,0,0.6);
}
@media (prefers-color-scheme: dark) {
  .dot {
    box-shadow: 0 0 10px rgba(255,255,255,0.4);
  }
}

.idx-info {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: var(--muted);
  user-select: none;
  text-align: center;
}

.focus-card {
  min-width: 0;
}

.post-card.focus-card-inner {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 1rem 1rem 1rem;
  box-shadow: var(--shadow-card);
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: 1.1rem;
  line-height: 1.6;
}

.post-card.focus-card-inner .content a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: rgba(255,255,255,0.4);
}

@media (max-width: 560px) {
  .focus-layout {
    grid-template-columns: 1fr;
    row-gap: 1.5rem;
  }

  .focus-left {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    column-gap: 2rem;
  }

  .focus-time {
    margin-bottom: 0;
  }
}
</style>
