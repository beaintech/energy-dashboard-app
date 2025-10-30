<template>
<div class="filter-bar">
    <!-- 状态下拉 -->
    <select v-model="statusLocal">
      <option value="all">Alle</option>
      <option value="charging">Ladevorgang</option>
      <option value="idle">Leerlauf</option>
      <option value="offline">Offline</option>
      <option value="error">Fehler</option>
    </select>

    <!-- 关键字搜索 -->
    <input
      v-model="searchLocal"
      type="text"
      placeholder="Gerätename oder ID suchen..."
    />
  </div>
</template>
<script setup lang="ts">

/*
面试官追问：

那 FilterBar 和 DeviceTable 是怎么联动的？

你：

FilterBar 会发出选中的状态（如“仅显示在线设备”），
DeviceTable 接收这个状态，并在 computed 中过滤 Vuex 设备数据。
*/

import { ref, watch } from 'vue';

/*
面试官追问：
先说筛选与搜索。状态过滤、关键字搜索是怎么联动的？有没有防抖？输入中文或德语变音字会不会搜不到？
你：
筛选与搜索在 FilterBar.vue 中产生，向上触发 update:filter、update:query 事件；在 DashboardPage.vue 中接收后，同步到路由 query。为了避免频繁渲染，我对关键字搜索做了 300ms 防抖；对于德语变音字，我做了简单的“规范化”处理（把 ä/ö/ü/ß 统一到 ae/oe/ue/ss 的可选匹配），同时把大小写忽略，确保“Düsseldorf”与“Dusseldorf”能匹配到同一条。
*/

const emit = defineEmits<{
  (e: 'update:status', v: string): void;
  (e: 'update:query', v: string): void;
}>();

// 本地状态
const statusLocal = ref('all');
const searchLocal = ref('');

let debounceTimer: number | undefined;

// 监听下拉框变化 → 直接同步到父组件
watch(statusLocal, (v) => emit('update:status', v));

// 输入框加防抖（300ms）
watch(searchLocal, (v) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => emit('update:query', v), 300);
});
</script>

<style scoped>
.filter-bar {
  display:flex; gap:10px; align-items:center;
  background:var(--card-bg); padding:10px 12px; border-radius:12px; box-shadow:var(--shadow-sm);
  select, input { padding:8px 10px; border:1px solid #D7DCE3; border-radius:8px; background:transparent; color:var(--fg); }
  input { flex:1; }
}

.filter-bar input {
  flex: 1;
  padding: 6px 8px;
}
.filter-bar select {
  padding: 6px 8px;
}
</style>
