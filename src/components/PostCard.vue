<template>
  <article class="post-card">
    <div class="content" v-html="linkedContent"></div>
    <div
      class="time"
      v-if="!hideTime"
    >
      {{ prettyTime }}
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  content: { type: String, required: true },
  created_at: { type: String, required: true },
  hideTime: { type: Boolean, default: false }
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
  return text.replace(
    urlRegex,
    url => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`
  );
}

const linkedContent = computed(() => {
  const safe = escapeHTML(props.content);
  return linkify(safe).replace(/\n/g, "<br/>");
});

function formatTime(iso) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours() + "").padStart(2, "0");
  const min = String(d.getMinutes() + "").padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

const prettyTime = computed(() => formatTime(props.created_at));
</script>

<style scoped>
.post-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 1rem 1rem 0.75rem;
  box-shadow: var(--shadow-card);
  margin-bottom: 1rem;

  word-wrap: break-word;
  overflow-wrap: break-word;
}

.content {
  font-size: 1rem;
  line-height: 1.5;
}

.content a {
  color: inherit;
  text-decoration: underline;
  text-decoration-color: rgba(0, 0, 0, 0.3);
}

@media (prefers-color-scheme: dark) {
  .content a {
    text-decoration-color: rgba(255, 255, 255, 0.4);
  }
}

.time {
  color: var(--muted);
  font-size: 0.8rem;
  margin-top: 0.75rem;
  text-align: right;
}
</style>
