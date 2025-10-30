<template>
    <div>
  <table class="device-table">
    <thead>
      <tr><th>Ladepunkt</th><th>Beschreibung</th><th>Status</th><th>Leistung</th></tr>
    </thead>
      <tbody>
        <tr v-for="d in devices" :key="d.id">
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
    </div>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';

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
  filter?: string;
  total?: number;
  page?: number;
  pageSize?: number;
}>();

/*
面试官追问：
你这里的过滤是放在表格里做的吗？如果我在上面 FilterBar 选了"只看离线"，
那你是重新拉接口，还是前端本地过滤？
你：
第一层过滤我放在 DashboardPage 里统一做，这样图表和表格看到的是同一批设备；
DeviceTable 只负责显示已经过滤和分页好的数据，避免两个地方的规则不一致。
*/

const emit = defineEmits<{
  'change-page': [page: number];
  'change-size': [size: number];
}>();

const page = computed(() => props.page ?? 1);
const pageSize = computed(() => props.pageSize ?? 10);
const total = computed(() => props.total ?? props.devices.length);

const pagesCount = computed(() =>
  Math.max(1, Math.ceil(total.value / pageSize.value))
);

// pageSize change
function onSizeChange(e: Event) {
  const v = Number((e.target as HTMLSelectElement).value);
  emit('change-size', v);
}

</script>

<style scoped lang="scss">
.device-table {
  overflow-x: auto;
  width: 100%;
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
  .status.error { background: #638ad6; }

}
</style>
