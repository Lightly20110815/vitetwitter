<template>
  <div v-if="postSafe" class="focus-layout">

    <!-- 左侧：时间 + 可拖动圆点 -->
    <div class="focus-left">
      <!-- 点日期切换到 timeline 视图 -->
      <div class="focus-time" @click="toggleView" title="点击切换成时间线视图">
        <div class="focus-hm">{{ hhmm }}</div>
        <div class="focus-date">{{ mmddyyyy }}</div>
      </div>

      <div class="focus-nav">
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

  <!-- 如果没有 postSafe（理论上不太会发生），就显示个兜底 -->
  <div v-else style="color:var(--muted); font-size:0.9rem; text-align:center; padding:2rem 0;">
    no post.
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

/* ---------- 安全防御：如果父级传了 undefined，就别渲染 ---------- */
const postSafe = computed(() => {
  return props.post && props.post.created_at && props.post.content !== undefined
    ? props.post
    : null;
});

/* ---------- 时间格式化 ---------- */
function parseParts(iso) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  const hh = String(d.getHours()).padStart(2,"0");
  const m2 = String(d.getMinutes()).padStart(2,"0");
  return {
    hhmm: `${hh}:${m2}`,
    mmddyyyy: `${mm}/${dd}/${yyyy}`
  };
}

const hhmm = computed(() => {
  if (!postSafe.value) return "";
  return parseParts(postSafe.value.created_at).hhmm;
});
const mmddyyyy = computed(() => {
  if (!postSafe.value) return "";
  return parseParts(postSafe.value.created_at).mmddyyyy;
});

/* ---------- 内容渲染 ---------- */
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const linkedContent = computed(() => {
  if (!postSafe.value) return "";
  const raw = postSafe.value.content || "";
  const safe = escapeHTML(raw);

  // 把 URL 变成 <a>
  const withLinks = safe.replace(/(https?:\/\/[^\s]+)/g, (match) => {
    return `<a href="${match}" target="_blank" rel="noopener">${match}</a>`;
  });

  // 把换行符变成 <br/>
  return withLinks.replace(/\n/g, "<br/>");
});

/* ---------- 拖动逻辑 ---------- */
const dragging = ref(false);
const startY = ref(0);
const deltaY = ref(0);
const dragDirection = ref(null); // 'up' | 'down' | null
const TRIGGER_DISTANCE = 40; // px

function onPointerDown(e) {
  dragging.value = true;
  startY.value = e.clientY;
  deltaY.value = 0;
  dragDirection.value = null;
  e.currentTarget.setPointerCapture(e.pointerId);
}

function onPointerMove(e) {
  if (!dragging.value) return;
  deltaY.value = e.clientY - startY.value;

  if (deltaY.value < -10) {
    dragDirection.value = "up";   // 上拖
  } else if (deltaY.value > 10) {
    dragDirection.value = "down"; // 下拖
  } else {
    dragDirection.value = null;
  }
}

function onPointerUp(e) {
  if (!dragging.value) return;

  if (deltaY.value <= -TRIGGER_DISTANCE) {
    emit("next"); // 上拖够远 => 看更新的
  } else if (deltaY.value >= TRIGGER_DISTANCE) {
    emit("prev"); // 下拖够远 => 看更旧的
  }

  dragging.value = false;
  deltaY.value = 0;
  dragDirection.value = null;

  try {
    e.currentTarget.releasePointerCapture(e.pointerId);
  } catch {}
}

const dotStyle = computed(() => {
  const clamped = Math.max(-30, Math.min(30, deltaY.value));
  return {
    transform: `translateY(${clamped}px)`,
    transition: dragging.value ? "none" : "transform 0.08s linear"
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

/* 左列：时间 & 手势控制 */
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

/* 可拖拽手柄 */
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
  touch-action: none;
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
}
@media (prefers-color-scheme: dark) {
  .dot {
    box-shadow: 0 0 10px rgba(255,255,255,0.4);
  }
}

/* 上/下提示箭头 */
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

/* 当前第几条 / 总数 */
.idx-info {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: var(--muted);
  user-select: none;
  text-align: center;
}

/* 右边卡片 */
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

/* 窄屏布局 */
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
