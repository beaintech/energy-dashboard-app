<template><div ref="el" class="chart-panel card">12343</div></template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

/*
面试官追问：
如果用户想要在一个图表里选择时间范围，然后另外两张图也同步显示同样区间，这个实现里就自动支持了吗？

你：
是的。
 因为我用了 echarts.connect(group)，ECharts 内部已经帮我同步了所有同组实例的 dataZoom 事件。
 所以只要其中一张图拖动或缩放，其他图表就会收到相同事件。
 不需要额外写 emit 或 Vue 状态管理逻辑。

 */
echarts.use([
  LineChart,
  BarChart,
  TitleComponent,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  LegendComponent,
  CanvasRenderer,
]);

const props = defineProps<{
  title: string;
  series: [number, number][];
  group?: string;
  color?: string; // 可覆写线色
}>();

const el = ref<HTMLDivElement | null>(null);
let chart: echarts.ECharts | null = null;
let ro: ResizeObserver | null = null;
let mo: MutationObserver | null = null;

function css(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function render() {
  if (!chart) return;
  const data = props.series?.length ? props.series : localSeries.value;
  if (!data?.length) return;

  chart.setOption({
    title: { text: props.title, left: 'center', textStyle: { color: css('--fg', '#222'), fontSize: 13 } },
    tooltip: { trigger: 'axis' },
    grid: { top: 40, left: 40, right: 10, bottom: 50 },
    dataZoom: [{ type: 'inside' }, { type: 'slider', bottom: 10 }],
    xAxis: { type: 'time', axisLabel: { color: css('--fg', '#222') } },
    yAxis: { type: 'value', axisLabel: { color: css('--fg', '#222') } },
    series: [{
      type: 'line',
      showSymbol: false,
      smooth: true,
      data,
      lineStyle: { color: props.color ?? css('--primary', '#2563eb'), width: 2 },
    }],
  });
  nextTick(() => chart?.resize());
}


/*
面试官追问：
ECharts 的联动部分你是怎么写的？能具体讲讲 ChartPanel 是怎么做的吗？

你：
在 ChartPanel.vue 里，我创建每个 ECharts 实例时给它指定 group。
 然后在挂载时调用 echarts.connect(group)。
 这样所有相同 group 的图就能自动同步缩放和拖动。
此外我还绑定了响应式 watch，当传入的 series 更新时自动重绘。

*/

const localSeries = ref<[number, number][]>([]);

onMounted(() => {
  chart = echarts.init(el.value!);
  if (props.group) {
    chart.group = props.group;
    echarts.connect(props.group);
  }

    // ✅ 測試假數據
  if (!props.series?.length) {
    const now = Date.now();
    localSeries.value = Array.from({ length: 20 }, (_, i) => [now + i * 60000, Math.random() * 10]);
  } else {
    localSeries.value = props.series;
  }

  render();

  // 容器尺寸变化
  ro = new ResizeObserver(() => chart?.resize());
  ro.observe(el.value!);

  // 主题类变化（html.dark 切换）
  mo = new MutationObserver(() => { render(); });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // 窗口尺寸
  window.addEventListener('resize', onWin);
});
function onWin() { chart?.resize(); }

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWin);
  ro?.disconnect(); mo?.disconnect();
  chart?.dispose(); chart = null;
});

watch(() => props.series, render, { deep: true }); // 监听数据变化 响应式 watch 实现实时更新；


/*
所以你的联动逻辑是：
三个独立 ECharts 实例；


同 group 联动；


JSON 数据异步并发加载；


自动归一化时间戳；


性能流畅、交互自然。



你总结：
对，这个模块主要展示我在前端可视化同步与数据对齐上的能力。
核心点是：
echarts.connect(group) 实现同步缩放；


normalizeTimestamps() 保证时间对齐；


Promise.all() 并发加载三源数据；


响应式 watch 实现实时更新；


CanvasRenderer 提升性能（比 SVG 渲染更流畅）。
*/
</script>

<style scoped lang="scss">
.chart-panel { height: 280px; }
@media (max-width: 740px) { .chart-panel { height: 240px; } }
</style>
