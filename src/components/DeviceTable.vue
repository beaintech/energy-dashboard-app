<template>
  <table class="device-table">
    <thead>
      <tr><th>Ladepunkt</th><th>Beschreibung</th><th>Status</th><th>Leistung</th></tr>
    </thead>
      <!-- 这里直接用 props.devices -->
      <tbody v-for="d in devices" :key="d.id">
        <tr  v-if="showRow(d)">
            <td>{{ d.name ?? d.id }}</td>
            <td>{{ d.id }}</td>
            <td>
            <span class="status" :class="d.status">{{ d.status }}</span>
            </td>
            <td>{{ d.power }} kW</td>
        </tr>
            
      <tr v-if="!devices.length">
        <td colspan="4" style="text-align:center; padding:12px;">Keine Daten</td>
      </tr>
    </tbody>
  </table>
    <div class="pagination" v-if="pagesCount > 1">
      <button
        :disabled="page <= 1"
        @click="emit('change-page', page - 1)"
      >
        ‹
      </button>
      <span>{{ page }} / {{ pagesCount }}</span>
      <button
        :disabled="page >= pagesCount"
        @click="emit('change-page', page + 1)"
      >
        ›
      </button>

      <!-- 可选：改pageSize -->
      <select :value="pageSize" @change="onSizeChange">
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
      </select>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from 'vue';
import type { Device } from '@/store/devices';

/*
面试官总结：

OK，这样的话你的 Dashboard 是：

一进页面立即有快照；

后续用伪 WebSocket 动态更新；

UI 响应流畅；

支持状态过滤和主题切换。

你总结：

对，我整个结构是：

Composition API 控制数据流；

Vuex 管全局状态；

ECharts 可视化负载；

Mock JSON 代替真实后端；

FakeSocket 模拟实时流；

CSS 变量 + 明暗主题 提升 UI 一致性。
*/

interface Device { 
    id: string; 
    name: string; 
    status: 'charging' | 'offline' | 'idle' | 'error';
    power: number; 
}

const props = defineProps<{
  devices: Device[];
  // 保留接口：父组件也许会传 filter，但真正的过滤我们让父去做
  filter?: string;
  total?: number;
  page?: number;
  pageSize?: number;
}>();

/**
 * 统一一条逻辑：
 * - 如果 filter 是 'all' → 全部显示
 * - 如果 filter 等于设备的 status → 显示
 * - 如果 filter 是文本 → 拿 name 去模糊匹配
 */
function showRow(d: Device) {
  const f = (props.filter ?? 'all').toLowerCase();
  if (f === 'all') return true;

  // match by status
  if ((d.status ?? '').toLowerCase() === f) return true;

  // match by name (text search)
  if ((d.id ?? '').toLowerCase().includes(f)) return true;

  // if none matched
  return false;
}


/*
面试官追问：
你这里的过滤是放在表格里做的吗？如果我在上面 FilterBar 选了“只看离线”，
那你是重新拉接口，还是前端本地过滤？
你：
第一层过滤我放在 DashboardPage 里统一做，这样图表和表格看到的是同一批设备；
DeviceTable 里只做“兜底过滤”和显示，不再做复杂逻辑，避免两个地方的规则不一致。
*/

const page = computed(() => props.page ?? 1);
const pageSize = computed(() => props.pageSize ?? 10);
const total = computed(() => props.total ?? props.devices.length);

// 这里是兜底的“表格内过滤” —— 万一父组件传了全部的数据进来
const visibleRows = computed(() => {
  // 1) 先按 status 兜底过滤
  const base =
    !props.filter || props.filter === 'all'
      ? props.devices
      : props.devices.filter(
          (d) => (d.status ?? '').toLowerCase() === props.filter!.toLowerCase()
        );

  // 2) 再做一层本地分页（保证这个组件自己也能翻页）
  const start = (page.value - 1) * pageSize.value;
  return base.slice(start, start + pageSize.value);
});

const pagesCount = computed(() =>
  Math.max(1, Math.ceil(total.value / pageSize.value))
);
</script>

<style scoped lang="scss">
.device-table {
  overflow-x: auto;
  table {
    width: 100%;
    border-collapse: collapse;
    th, td {
      padding: 8px 10px;
      border-bottom: 1px solid #ddd;
      text-align: left;
    }
    th {
      background: #f6f6f6;
      color: #333;
      font-weight: 600;
    }
  }

  .status {
    padding: 3px 6px;
    border-radius: 4px;
    color: white;
    font-size: 0.85rem;
  }
  .status.charging { background: #16a34a; }
  .status.idle { background: #f59e0b; }
  .status.offline { background: #6b7280; }
}
</style>
