<template>
  <div class="timeline-row">
    <!-- 左侧时间块（可点击切换粒度） -->
    <div
      class="tl-time"
      @click="onToggleMode"
      title="点击切换显示粒度 (日 → 月 → 年)"
    >
      <div class="tl-date">{{ mainLabel }}</div>
      <div class="tl-hm" v-if="subLabel">{{ subLabel }}</div>
    </div>

    <!-- 中间竖线 + 圆点 -->
    <div class="tl-line">
      <div class="tl-dot"></div>
      <div class="tl-stem"></div>
    </div>

    <!-- 右侧卡片内容 -->
    <div class="tl-card">
      <PostCard :content="content" :created_at="created_at" hideTime />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import PostCard from "./PostCard.vue";

const emit = defineEmits(["requestToggleMode"]);

const props = defineProps({
  content: { type: String, required: true },
  created_at: { type: String, required: true },
  mode: { type: String, default: "day" } // "day" | "month" | "year"
});

// 拆时间
function parts(iso) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const m2 = String(d.getMinutes()).padStart(2, "0");
  return {
    yyyy,
    mm,
    dd,
    hm: `${hh}:${m2}`
  };
}

const parsed = computed(() => parts(props.created_at));

const mainLabel = computed(() => {
  if (props.mode === "year") {
    // 2025
    return parsed.value.yyyy;
  }
  if (props.mode === "month") {
    // 2025-10
    return `${parsed.value.yyyy}-${parsed.value.mm}`;
  }
  // day 模式
  return `${parsed.value.yyyy}-${parsed.value.mm}-${parsed.value.dd}`;
});

const subLabel = computed(() => {
  if (props.mode === "day") {
    // 在 day 模式下我们额外显示 hh:mm
    return parsed.value.hm;
  }
  // month/year 模式不显示第二行
  return "";
});

function onToggleMode() {
  emit("requestToggleMode");
}
</script>

<style scoped>
.timeline-row {
  display: grid;
  grid-template-columns: auto 24px 1fr;
  column-gap: 1rem;
  align-items: flex-start;
  margin-bottom: 2rem;
}

/* 左侧时间块 */
.tl-time {
  text-align: right;
  line-height: 1.3;
  min-width: 5.5rem;
  user-select: text;
  word-break: keep-all;
  white-space: nowrap;
  cursor: pointer;
  position: sticky;
  top: 1rem; /* 让它在滚动时像固定参考点 */
  align-self: start;
  /* 轻轻淡一点 */
  color: var(--muted);
  font-size: 0.75rem;
}

.tl-time:hover {
  filter: brightness(1.1);
}

.tl-date {
  font-weight: 500;
  color: var(--fg);
  font-size: 0.8rem;
}
@media (prefers-color-scheme: dark) {
  .tl-date {
    color: var(--fg);
  }
}

.tl-hm {
  font-size: 0.7rem;
  color: var(--muted);
}

/* 中间竖线部分 */
.tl-line {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tl-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background-color: var(--fg);
  box-shadow: 0 0 8px rgba(0,0,0,0.4);
  margin-top: 4px;
}
@media (prefers-color-scheme: dark) {
  .tl-dot {
    box-shadow: 0 0 8px rgba(255,255,255,0.4);
  }
}

.tl-stem {
  flex: 1;
  width: 2px;
  background: var(--border-color);
  margin-top: 4px;
  border-radius: 1px;
}

/* 右侧卡 */
.tl-card {
  min-width: 0;
}

/* 窄屏适配：手机时不要三列，回到上下结构 */
@media (max-width: 480px) {
  .timeline-row {
    grid-template-columns: 1fr;
    row-gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .tl-time {
    position: static;
    text-align: left;
    min-width: auto;
    white-space: normal;
    color: var(--muted);
    font-size: 0.75rem;
    line-height: 1.2;
  }

  .tl-date {
    display: inline;
    font-weight: 500;
    font-size: 0.8rem;
    color: var(--fg);
  }

  .tl-hm {
    display: inline;
    margin-left: 0.5rem;
    font-size: 0.75rem;
  }

  .tl-line {
    display: none;
  }
}
</style>
