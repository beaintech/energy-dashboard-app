import { onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';

// 模拟 WebSocket 的推送行为

/* 
在面试环境下我不能用真实 WebSocket，所以我用一个 伪实时流（FakeSocket）。
这个模块定义在：
📁 src/composables/useRealtime.ts。

我通过 setInterval() 每 3 秒钟随机更改几台设备的功率和状态，
把这些变化推送成事件数组，然后合批传给 Vuex 的 applyLiveEvents()。
这样整个界面看起来就像在“动”。
*/

export function useRealtime() {
  const store = useStore();
  let timer: number;

/*
面试官追问：
那如果连接断开了，或者用户切到别的标签页再回来，会怎样？

你：
我在 useRealtime 里模拟了断线重连逻辑，如果失去焦点，就暂停推送；恢复焦点再恢复。
而且每次返回页面时，会重新 fetch 一次快照（防止状态不同步）。
*/
  let active = true;

  window.addEventListener('blur', () => (active = false));
  window.addEventListener('focus', () => (active = true));

    const pushFakeEvents = () => {
    if (!active) return; // 暂停推送
    const updates = Array.from({ length: 3 }).map(() => ({
        id: Math.floor(Math.random() * 10) + 1,
        power: +(Math.random() * 22).toFixed(2),
        status: Math.random() > 0.5 ? 'charging' : 'idle',
    }));
    store.dispatch('devices/applyLiveEvents', updates);
    };

  onMounted(() => {
    timer = window.setInterval(pushFakeEvents, 3000);
  });

  onBeforeUnmount(() => {
    clearInterval(timer);
  });
}
