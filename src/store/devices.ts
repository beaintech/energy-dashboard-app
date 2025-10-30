import type { Module, ActionContext } from 'vuex';
import axios from 'axios';

/**
 * 设备类型（保持你最开始那版）
 */
export interface Device {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'charging' | 'idle';
  power: number;
  energy: number;
}

/**
 * 曲线点的类型
 * 后端返回通常是 [{ "timestamp": 1730265600000, "value": 12.3 }, ...]
 * 我们会转成 [number, number][] 给 ECharts 用
 */
type SeriesPoint = [number, number];

export interface DevicesState {
  list: Device[];
  pv: SeriesPoint[];
  load: SeriesPoint[];
  grid: SeriesPoint[];
}

/**
 * 把后端来的不规则时间序列对齐到统一步长
 * 默认 5 分钟（300000 ms）
 */
function normalizeTimestamps(
  data: Array<{ timestamp: number; value: number }>,
  step = 300000
): SeriesPoint[] {
  if (!data || data.length === 0) return [];
  // 先按时间排个序，防止后端给的不是升序
  const sorted: any = [...data].sort((a, b) => a.timestamp - b.timestamp);
  const min = sorted[0].timestamp;
  const max = sorted[sorted.length - 1].timestamp;

  // 用 Map 提高查找速度
  const map = new Map<number, number>();
  for (const d of sorted) {
    map.set(d.timestamp, d.value);
  }

  /*
  面试官追问：
你提到数据来自不同来源，怎么保证时间轴能对齐？
 比如 PV 每 15 分钟一条，而 Grid 每 5 分钟一条？

你：
我在导入数据的时候，使用了一个统一的时间归一化函数（normalizeTimestamps）。
 它会把所有数据的时间戳映射到统一的间隔，比如以分钟为单位补齐。
 缺失点自动插值，避免折线错位。

*/

  const result: SeriesPoint[] = [];
  for (let t = min; t <= max; t += step) {
    // 如果这一分钟/5分钟没有值，就用 0（也可以改成最后一个值）
    const v = map.get(t) ?? 0;
    result.push([t, v]);
  }
  return result;
}

/**
 * Vuex 模块（合并后的唯一版本）
 */
export const devices: Module<DevicesState, unknown> = {
  namespaced: true,
  state: (): DevicesState => ({
    list: [],
    pv: [],
    load: [],
    grid: [],
  }),

  actions: {
    /**
     * 首屏快照：
     * - 设备列表
     * - 三条曲线
     * 一次性并发拿，跟你前面说的“先 snapshot 再实时”一致
     */
    async fetchSnapshot({ commit }: ActionContext<DevicesState, unknown>) {
      // 看看本地有没有缓存的设备（比如你 addDevice 后存入了 localStorage）
      const cachedDevices = localStorage.getItem('devices');


      /*
      面试官追问：
        那三个数据源的加载是同时进行的吗？如果某一个 JSON 文件加载慢，会不会影响整体渲染？

        你：
        不会。
        我用的是 Promise.all() 并发加载三个 JSON。
        渲染逻辑在 commit('setData') 之后执行，
        而且每个图表组件自身会 watch series 更新，所以它们可以独立完成初始化。
        即使 PV 数据晚一点回来，Load 和 Grid 图也会先画出来。
        */
      const [d, g, l, p] = await Promise.all([
        axios.get<Device[]>('/api/devices.json'),
        axios.get<Array<{ timestamp: number; value: number }>>('/api/grid.json'),
        axios.get<Array<{ timestamp: number; value: number }>>('/api/load.json'),
        axios.get<Array<{ timestamp: number; value: number }>>('/api/pv.json'),
      ]);

      commit('setSnapshot', {
        // 如果本地有缓存过的新设备，就用缓存；否则用 mock
        d: cachedDevices ? JSON.parse(cachedDevices) : d.data,
        g: g.data,
        l: l.data,
        p: p.data,
      });
    },

    /**
     * 实时增量更新（WebSocket mock 会调用这个）
     * 这里保持你最一开始说的写法：只更新有 id 的那些条目
     */
    applyLiveEvents({ commit }: ActionContext<DevicesState, unknown>, events: Partial<Device>[]) {
      commit('updateDevices', events);
    },

    /**
     * 新建设备（表单提交成功后调用）
     * 1. 立即写进 Vuex
     * 2. 持久化到 localStorage（这样刷新页面也在）
     */
    addDevice({ commit, state }: ActionContext<DevicesState, unknown>, newDevice: Device) {
      commit('appendDevice', newDevice);
      // 同步写回 localStorage
      const copy = [...state.list, newDevice];
      localStorage.setItem('devices', JSON.stringify(copy));
    },
  },

  mutations: {
    /**
     * 一次性写入首屏数据（列表 + 三条曲线）
     */
    setSnapshot(
      state: DevicesState,
      payload: {
        d: Device[];
        g: Array<{ timestamp: number; value: number }>;
        l: Array<{ timestamp: number; value: number }>;
        p: Array<{ timestamp: number; value: number }>;
      }
    ) {
      state.list = payload.d;
      // 这里三条曲线统一做 normalize，保持第 3 题的逻辑
      state.grid = normalizeTimestamps(payload.g);
      state.load = normalizeTimestamps(payload.l);
      state.pv = normalizeTimestamps(payload.p);
    },

    /**
     * 实时更新：只更新变了的设备
     * events 里只要有 id，就能精准找到并覆盖
     */
    updateDevices(state: DevicesState, updates: Array<Partial<Device> & { id: number }>) {
      for (const upd of updates) {
        const target = state.list.find((d) => d.id === upd.id);
        if (target) {
          Object.assign(target, upd);
        }
      }
    },

    /**
     * 新建设备写入到列表末尾
     */
    appendDevice(state: DevicesState, d: Device) {
      state.list.push(d);
    },
  },
};
