<template>
   <div class="dashboard-page">
    <DashboardHeader />

    <section class="charts">
      <ChartPanel title="PV-Leistung"   :series="store.state.devices.pv"   group="energyGroup" color="#22c55e" />
      <ChartPanel title="Netzleistung"  :series="store.state.devices.grid" group="energyGroup" color="#f97316" />
      <ChartPanel title="Lastprofil"    :series="store.state.devices.load" group="energyGroup" color="#3b82f6" />
    </section>

    <FilterBar
      :search="query"
      :status="status"
      @update:search="v => updateQuery('q', v)"
      @update:status="v => updateQuery('status', v)"
    />
    <DeviceTable
      :devices="devices"
      :filter="status"
      :total="total"
      :page="page"
      :page-size="pageSize"
      @change-page="p => updateQuery('page', p)"
      @change-size="s => updateQuery('pageSize', s)"
    />
  </div>

</template>

<script setup lang="ts">
import { computed, onMounted, watch, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import DashboardHeader from '@/components/DashboardHeader.vue';
import FilterBar from '@/components/FilterBar.vue';
import DeviceTable from '@/components/DeviceTable.vue';
import ChartPanel from '@/components/ChartPanel.vue';
import { useRealtime } from '@/composables/useRealtime';

const store = useStore();
const route = useRoute();
const router = useRouter();

// 引入实时通道（伪 WebSocket）
useRealtime();

/*
面试官：
你的 Dashboard 上这几张折线图是怎么做的？
 我看到 PV、Load、Grid 三条曲线，它们是怎么同步在一起滚动和缩放的？

你：
我这三张图其实是 三个独立的 ECharts 实例，
 但是它们之间通过 共享同一个时间轴范围（x 轴范围） 来实现联动。
我使用了 ECharts 内置的 group 和 connect() 方法：
给每个图表一个相同的 group 名称；


当任意一张图表缩放、平移时，其他图表自动同步。


同时，我在数据层面使用 Vuex 管理三种来源（PV、Load、Grid），
 每个曲线数据都是 [timestamp, value] 结构，
 所以时间对齐非常自然。
 */
// 首屏快照
// --- 1. 首屏：加载数据 ---
onMounted(async () => {
  // 加载快照
  await store.dispatch('devices/fetchSnapshot');

  // 🔧 核心修复点 #1：强制同步 router 状态，让分页和 devices 对齐
  await nextTick();
  router.replace({ query: { ...route.query } });
});

// --- 2. 状态引用 ---
const devices = computed(() => store.state.devices.list ?? []);

const status = computed(() => (route.query.status as string) || 'all');
const query = computed(() => (route.query.q as string) || '');
const page = computed(() => Number(route.query.page || 1));
const pageSize = computed(() => Number(route.query.pageSize || 10));

function updateQuery(k: string, v: string | number) {
  const newQuery: any = { ...route.query, [k]: String(v) };
  // Reset to page 1 when filter or search changes
  if (k === 'status' || k === 'q') {
    newQuery.page = '1';
  }
  router.replace({ query: newQuery });
}

// --- 3. 归一化函数 ---
function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
}

// --- 4. 数据过滤 ---
const filtered = computed(() => {
  if (!devices.value.length) return [];
  const qn = normalize(query.value || '');
  return devices.value.filter((d: any) => {
    // 1) 状态过滤
    const okStatus =
      status.value === 'all'
        ? true
        : normalize(d.status ?? '') === normalize(status.value ?? '');
    if (!okStatus) return false;
    
    // 2) 搜索过滤 - 如果没有搜索词，则全部通过
    if (!qn) return true;
    
    // 3) 在 name 和 id 中搜索
    const name = normalize(d.name ?? '');
    const id = normalize(d.id ?? '');
    return name.includes(qn) || id.includes(qn);
  });
});

// --- 5. 排序 + 分页 ---
const sorted = computed(() => {
  const weight = (s: string) =>
    s === 'charging' ? 0 : s === 'idle' ? 1 : s === 'offline' ? 2 : 3;
  return [...filtered.value].sort((a: any, b: any) => {
    const dw = weight(a.status ?? '') - weight(b.status ?? '');
    if (dw !== 0) return dw;
    return String(a.name ?? '').localeCompare(String(b.name ?? ''));
  });
});

const total = computed(() => sorted.value.length);

const paged = computed(() => {
  if (!sorted.value.length) return [];
  const p = page.value < 1 ? 1 : page.value;
  const start = (p - 1) * pageSize.value;
  return sorted.value.slice(start, start + pageSize.value);
});

// --- 6. 核心修复点 #2：确保 devices 一加载完自动触发重新计算分页 ---
watch(
  () => store.state.devices.list,
  () => {
    // 数据变化时强制刷新一次路由状态（触发重渲染）
    router.replace({ query: { ...route.query } });
  },
  { immediate: true }
);

</script>

<style scoped lang="scss">
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
}
.charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 18px;
  background: var(--bg);
}
</style>
