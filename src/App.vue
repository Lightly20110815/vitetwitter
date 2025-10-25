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
      <FocusView
        v-if="viewMode === 'focus'"
        :post="sortedPosts[currentIndex]"
        :index="currentIndex"
        :total="sortedPosts.length"
        @prev="goPrev"
        @next="goNext"
        @toggleView="toggleViewMode"
      />

      <TimelineList
        v-else
        :posts="sortedPosts"
        @toggleView="toggleViewMode"
      />
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

// 所有帖子：按时间新->旧排序
const sortedPosts = computed(() => {
  return [...postsRaw].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
});

// 当前模式: "focus" = 单条大卡模式, "timeline" = 列表模式
const viewMode = ref("focus");

// currentIndex = 现在在看的那一条（0 是最新）
const currentIndex = ref(0);

// 切换到上一条（更旧）
function goPrev() {
  if (currentIndex.value < sortedPosts.value.length - 1) {
    currentIndex.value += 1;
  }
}

// 切换到下一条（更新）
function goNext() {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
  }
}

// 切换视图模式
function toggleViewMode() {
  viewMode.value = viewMode.value === "focus" ? "timeline" : "focus";
}

const thisYear = new Date().getFullYear();
</script>

<style scoped>
.view-area {
  margin-top: 1rem;
}
</style>
