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
      <Transition name="fade" mode="out-in" appear>
        <!-- appear 让第一次加载也做淡入 -->
        <component
          :is="currentView"
          :key="viewModeKey"
          v-bind="currentViewProps"
          @prev="goPrev"
          @next="goNext"
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
import { ref, computed } from "vue";
import postsRaw from "./data/posts.json";
import FocusView from "./components/FocusView.vue";
import TimelineList from "./components/TimelineList.vue";

// 帖子按时间排序（新 -> 旧）
const sortedPosts = computed(() => {
  return [...postsRaw].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
});

// 视图模式: "focus" or "timeline"
const viewMode = ref("focus");

// 当前在看的那条的 index（0 是最新一条）
const currentIndex = ref(0);

// 切到更旧的一条
function goPrev() {
  if (currentIndex.value < sortedPosts.value.length - 1) {
    currentIndex.value += 1;
  }
}

// 切到更新的一条
function goNext() {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
  }
}

// 切换模式
function toggleViewMode() {
  viewMode.value = viewMode.value === "focus" ? "timeline" : "focus";
}

// 根据 viewMode 动态决定要渲染哪个组件 + 传哪些 props
const currentView = computed(() => {
  return viewMode.value === "focus" ? FocusView : TimelineList;
});

// 注意：`<component>` 里的 `key` 控制过渡重新触发
const viewModeKey = computed(() => {
  return viewMode.value === "focus"
    ? `focus-${currentIndex.value}` // 切贴文 or 回到 focus 时触发过渡
    : "timeline";
});

const currentViewProps = computed(() => {
  if (viewMode.value === "focus") {
    return {
      post: sortedPosts.value[currentIndex.value],
      index: currentIndex.value,
      total: sortedPosts.value.length
    };
  } else {
    return {
      posts: sortedPosts.value
    };
  }
});

const thisYear = new Date().getFullYear();
</script>

<style scoped>
/* 让中间块不贴边的间距在 global.css 里处理了，这里基本不用额外样式 */

/* 视图切换淡入淡出。跟 FocusView.vue 里那套 fade 是同名的。
   两边写一样是没问题的，但我们现在可以主导全局的感觉。 */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
