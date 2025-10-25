import FocusView from "./components/FocusView.vue";
import TimelineList from "./components/TimelineList.vue";
<template>
  <div class="focus-layout">

    <!-- 左侧：时间 + 可拖动圆点 -->
    <div class="focus-left">
      <!-- 点日期切换到 timeline 视图 -->
      <div class="focus-time" @click="toggleView" title="点击切换成时间线视图">
        <div class="focus-hm">{{ hhmm }}</div>
        <div class="focus-date">{{ mmddyyyy }}</div>
      </div>

      <div class="focus-nav">
        <!-- 这个容器用于决定拖动范围和视觉反馈 -->
        <div
          class="dot-wrapper"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @pointerleave="onPointerUp"
        >
          <div
            class="dot"
            :style="dotStyle"
          ></div>

          <div class="hint-area top-hint" :class="{ active: dragDirection === 'up' }">
            <div class="hint-arrow">▲</div>
          </div>
          <div class="hint-area bottom-hint" :class="{ active: dragDirection === 'down' }">
            <div class="hint-arrow">▼</div>
          </div>
        </div>

        <!-- index info / progress info（可选） -->
        <div class="idx-info">
          {{ index + 1 }} / {{ total }}
        </div>
      </div>
    </div>

    <!-- 右侧：大卡片内容 -->
    <div class="focus-card">
      <article class="post-card focus-card-inner">
        <div class="content" v-html="linkedContent"></div>
      </article>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  post: { type: Object, required: true },
  index: { type: Number, required: true },
  total: { type: Number, required: true }
});

const emit = defineEmits(["prev", "next", "toggleView"]);

function toggleView() {
  emit("toggleView");
}

// --- 时间格式化 ---
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

// --- 内容渲染（转义+链接+换行） ---
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
  return safe
    .replace(/(https?:\/\/[^\s]+)/g, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener">${url}</a>`;
    })
    .replace(/\n/g, "<br/>");
});

// --- 拖动逻辑 ---
const dragging = ref(false);
const startY = ref(0);        // pointerdown 的起始 Y
const deltaY = ref(0);        // 当前拖了多少 px
const dragDirection = ref(null); // 'up' | 'down' | null

// 你想要的“切换上一条/下一条”阈值（像拉一下再放手）
const TRIGGER_DISTANCE = 40; // px

function onPointerDown(e) {
  dragging.value = true;
  startY.value = e.clientY;
  deltaY.value = 0;
  dragDirection.value = null;
  // capture pointer
  e.currentTarget.setPointerCapture(e.pointerId);
}

function onPointerMove(e) {
  if (!dragging.value) return;

  deltaY.value = e.clientY - startY.value;

  if (deltaY.value < -10) {
    dragDirection.value = "up";   // 往上拖，意味着“看更新的一条”
  } else if (deltaY.value > 10) {
    dragDirection.value = "down"; // 往下拖，意味着“看更旧的一条”
  } else {
    dragDirection.value = null;
  }
}

function onPointerUp(e) {
  if (!dragging.value) return;

  // 决定是否触发切换
  if (deltaY.value <= -TRIGGER_DISTANCE) {
    // 上拉够远 => 下一条（更新的，index - 1）
    emit("next");
  } else if (deltaY.value >= TRIGGER_DISTANCE) {
    // 下拉够远 => 上一条（更旧的，index + 1）
    emit("prev");
  }

  // 重置
  dragging.value = false;
  deltaY.value = 0;
  dragDirection.value = null;

  // release pointer capture if needed
  try {
    e.currentTarget.releasePointerCapture(e.pointerId);
  } catch {}
}

// 圆点位置的视觉反馈：随 deltaY 微微偏移
const dotStyle = computed(() => {
  const clamped = Math.max(-30, Math.min(30, deltaY.value)); // 不要偏移太夸张
  return {
    transform: `translateY(${clamped}px)`
  };
});
</script>

<style scoped>
.focus-layout {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 1rem;
  align-items: flex-start;
}

/* 左边区域：时间和圆点 */
.focus-left {
  min-width: 7rem;
  color: var(--muted);
  font-size: 0.8rem;
  user-select: none;
}

/* 时间块：点击切换列表模式 */
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

/* 导航+圆点 */
.focus-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--fg);
}

/* 包裹实际可拖动区域 */
.dot-wrapper {
  position: relative;
  width: 32px;
  height: 90px;
  border-radius: 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border-color);
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  touch-action: none; /* 重要：允许手指拖拽而不是滚动页面 */
  cursor: grab;
}
@media (prefers-color-scheme: dark) {
  .dot-wrapper {
    background: rgba(255,255,255,0.03);
  }
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background-color: var(--fg);
  box-shadow: 0 0 10px rgba(0,0,0,0.6);
  transition: transform 0.08s linear;
}
@media (prefers-color-scheme: dark) {
  .dot {
    box-shadow: 0 0 10px rgba(255,255,255,0.4);
  }
}

/* 上下箭头提示区域（在 wrapper 里面） */
.hint-area {
  position: absolute;
  left: 0;
  right: 0;
  color: var(--muted);
  font-size: 0.6rem;
  text-align: center;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.12s;
  text-shadow: 0 0 6px rgba(0,0,0,0.6);
}
.top-hint { top: 4px; }
.bottom-hint { bottom: 4px; }

.hint-area.active {
  opacity: 1;
  color: var(--fg);
}

.hint-arrow {
  line-height: 1;
  font-size: 0.7rem;
}

/* index info */
.idx-info {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: var(--muted);
  user-select: none;
  text-align: center;
}

/* 右边卡片大视图 */
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

/* 手机：上下堆叠 */
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
