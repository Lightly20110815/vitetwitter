<template>
  <div class="page">
    <header class="site-header">
      <div class="name">Sy · timeline</div>
      <div class="sub">
        private micro-posts / only me<br />
        no likes · no comments · just thoughts
      </div>
    </header>

    <section class="view-area">
      <Transition
        :name="transitionName"
        mode="out-in"
        appear
      >
        <component
          :is="currentView"
          :key="viewMode === 'focus' ? `focus-${currentIndex}` : 'timeline'"
          v-bind="currentViewProps"
          @toggleView="toggleViewMode"
        />
      </Transition>
    </section>

    <footer class="site-footer">
      private microblog · {{ thisYear }}
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import postsRaw from "./data/posts.json";
import FocusView from "./components/FocusView.vue";
import TimelineList from "./components/TimelineList.vue";

/* 1. posts: 最新在前 */
const sortedPosts = computed(() => {
  return [...postsRaw].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
});

/* 2. 当前模式 */
const viewMode = ref("focus"); // "focus" | "timeline"

/* 3. 当前显示哪一条帖子 (0 是最新) */
const currentIndex = ref(0);

/* 4. 切换上一条/下一条 */
function goNext() {
  if (currentIndex.value < sortedPosts.value.length - 1) {
    currentIndex.value += 1;
    lastDirection.value = "next";
  }
}
function goPrev() {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
    lastDirection.value = "prev";
  }
}

/* 5. 切换视图模式 */
function toggleViewMode() {
  viewMode.value = viewMode.value === "focus" ? "timeline" : "focus";
}

/* 6. 当前渲染的组件 */
const currentView = computed(() => {
  return viewMode.value === "focus" ? FocusView : TimelineList;
});

/* 7. 传递给子组件的 props */
const currentViewProps = computed(() => {
  if (viewMode.value === "focus") {
    const posts = sortedPosts.value;
    const idx = currentIndex.value;
    return {
      post: posts[idx],
      index: idx,
      total: posts.length,
      isFirst: idx === 0,
      isLast: idx === posts.length - 1,
    };
  } else {
    return {
      posts: sortedPosts.value,
    };
  }
});

/* 8. footer 年份 */
const thisYear = new Date().getFullYear();

/* 9. 动画方向：根据最后一次 next/prev 决定是往上浮、还是往下落 */
const lastDirection = ref("idle");

const transitionName = computed(() => {
  if (viewMode.value !== "focus") return "fade";
  if (lastDirection.value === "next") return "slide-up";
  if (lastDirection.value === "prev") return "slide-down";
  return "fade";
});

/* 10. 全局滚轮交互（一次手势只翻一条 + 更快解锁） */

const SCROLL_THRESHOLD = 20; // 轻轻滑就够
let accumulated = 0;

// 一个手势内是否已经翻过一条
let gestureLocked = false;

// 用来判断“这一口气是不是结束”的timer
let settleTimer = null;

// 我们把 settle 延迟调短 → 80ms，几乎一停手就能继续翻下一条
const SETTLE_DELAY = 80;

function resetSettleTimer() {
  if (settleTimer) clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    gestureLocked = false;
    accumulated = 0;
    settleTimer = null;
  }, SETTLE_DELAY);
}

function triggerFromWheel(direction) {
  if (direction === "next") {
    const atEnd = currentIndex.value >= sortedPosts.value.length - 1;
    if (!atEnd) {
      goNext();
      gestureLocked = true;
      resetSettleTimer();
    } else {
      accumulated = 0;
    }
  } else if (direction === "prev") {
    const atStart = currentIndex.value <= 0;
    if (!atStart) {
      goPrev();
      gestureLocked = true;
      resetSettleTimer();
    } else {
      accumulated = 0;
    }
  }
}

function handleWheel(e) {
  // 只有在 focus 模式下，滚轮才代表“翻贴”
  if (viewMode.value !== "focus") return;

  const dy = e.deltaY;

  // 如果这一口气已经翻过一条了：
  // - 我们不再立刻翻
  // - 但是我们会不断 resetSettleTimer()，直到用户的手势真的停
  if (gestureLocked) {
    resetSettleTimer();
    return;
  }

  // 方向反转就重新累计
  if ((accumulated > 0 && dy < 0) || (accumulated < 0 && dy > 0)) {
    accumulated = 0;
  }

  accumulated += dy;

  if (accumulated > SCROLL_THRESHOLD) {
    triggerFromWheel("next");
  } else if (accumulated < -SCROLL_THRESHOLD) {
    triggerFromWheel("prev");
  }
}

onMounted(() => {
  window.addEventListener("wheel", handleWheel, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("wheel", handleWheel);
  if (settleTimer) {
    clearTimeout(settleTimer);
    settleTimer = null;
  }
});
</script>

<style scoped>
/* ============ 过渡动画 ============ */
/* 我们把 scale(...) 去掉，避免换行抖动。
   同时让 enter 和 leave 都 absolute，这样两张卡片叠放同样的宽度，
   浏览器不会以为容器在变宽变窄，就不会瞬间重新排字。
*/

/* slide-up: 旧的往上淡出, 新的从下浮上来 */
.slide-up-enter-active,
.slide-up-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  transition:
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(24px);
}
.slide-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-24px);
}

/* slide-down: 旧的往下淡出, 新的从上落下来 */
.slide-down-enter-active,
.slide-down-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  transition:
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-24px);
}
.slide-down-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(24px);
}

/* fade: 用于切 timeline / 返回 */
.fade-enter-active,
.fade-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* 容器本身要提供定位上下文，避免 absolute 的内容乱飞 */
.view-area {
  position: relative;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  /* 给它一个最小高度，避免过渡时高度塌陷导致跳行 */
  min-height: 200px;
}

/* ============ 页面布局 ============ */
.page {
  width: 100%;
  max-width: 900px;
  height: 100vh;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem 1rem 2rem;
  overflow: hidden;
  margin: 0 auto;
  box-sizing: border-box;
}

.site-header {
  text-align: center;
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1rem;
}
.site-header .name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--fg);
}
.site-header .sub {
  font-size: 0.8rem;
  color: var(--muted);
  margin-top: 0.25rem;
  line-height: 1.4;
}

.site-footer {
  text-align: center;
  font-size: 0.75rem;
  color: var(--muted);
  user-select: none;
  margin-top: 2rem;
}

@media (max-width: 480px) {
  .page {
    padding: 1rem 1rem 1.5rem;
  }
  .site-header {
    margin-bottom: 0.5rem;
  }
  .view-area {
    padding: 0.5rem 0;
    min-height: 160px;
  }
}
</style>
