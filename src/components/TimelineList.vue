<template>
  <div class="tl-wrapper">
    <div class="tl-head">
      <button class="back-btn" @click="$emit('toggleView')">
        ← back to focus view
      </button>
    </div>

    <div class="tl-list">
      <div
        v-for="post in postsSorted"
        :key="post.id"
        class="tl-item"
      >
        <div class="tl-meta">
          <div class="tl-date">{{ formatDate(post.created_at) }}</div>
          <div class="tl-time">{{ formatTime(post.created_at) }}</div>
        </div>
        <PostCard
          :content="post.content"
          :created_at="post.created_at"
          :hideTime="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import PostCard from "./PostCard.vue";

const props = defineProps({
  posts: { type: Array, required: true }
});

const postsSorted = computed(() => {
  return [...props.posts].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
});

function formatDate(iso) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatTime(iso) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const m2 = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${m2}`;
}
</script>

<style scoped>
.tl-head {
  text-align: center;
  margin-bottom: 1rem;
}
.back-btn {
  all: unset;
  cursor: pointer;
  color: var(--muted);
  font-size: 0.8rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 0.5rem 1rem;
  box-shadow: var(--shadow-card);
}

.tl-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tl-item {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 1rem;
  align-items: flex-start;
}

.tl-meta {
  min-width: 5rem;
  text-align: right;
  font-size: 0.75rem;
  line-height: 1.3;
  color: var(--muted);
  user-select: text;
  word-break: keep-all;
  white-space: nowrap;
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
.tl-time {
  font-size: 0.7rem;
  color: var(--muted);
}

/* 小屏：上下堆叠 */
@media (max-width: 560px) {
  .tl-item {
    grid-template-columns: 1fr;
    row-gap: 0.5rem;
  }
  .tl-meta {
    text-align: left;
    min-width: auto;
    white-space: normal;
    display: flex;
    gap: 0.5rem;
  }
}
</style>
