<template>
  <header class="dashboard-header">
    <h2>Dashboard – Standard-Konfiguration</h2>
    <button class="toggle-theme" @click="toggleTheme">
      {{ dark ? '☀️ Tag' : '🌙  Nacht' }}
    </button>
    <div class="actions">
      <button @click="toggleDropdown">➕ Hinzufügen</button>
      <ul v-if="dropdown" class="dropdown">
        <li @click="goTo('add-point')">Ladepunkt hinzufügen</li>
        <li>Ladegruppe hinzufügen</li>
        <li>Zähler hinzufügen</li>
      </ul>
    </div>
  </header>
    <div class="header-grid">
    <div class="kpi">
      <div class="label">Autarkie</div>
      <div class="value">{{ autarkie.toFixed(0) }}%</div>
    </div>
    <div class="kpi">
      <div class="label">Verbrauch</div>
      <div class="value">{{ verbrauch.toFixed(1) }} kVA</div>
    </div>
    <div class="kpi">
      <div class="label">Produktion</div>
      <div class="value">{{ produktion.toFixed(1) }} kVA</div>
    </div>
    <div class="kpi">
      <div class="label">Stromnetz Bezug</div>
      <div class="value">{{ grid.toFixed(1) }} kVA</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router';
const router = useRouter(); 
/*
面试官追问：
你这套界面怎么和我们图上的布局保持一致？

你：
整个 UI 用 DashboardHeader、FilterBar、DeviceTable 三个组件拼装，
布局完全对应 energielenker 界面：
*/

const dark = ref(false);
const toggleTheme = () => {
  dark.value = !dark.value;
  document.documentElement.classList.toggle('dark', dark.value);
};

const autarkie = ref(0)
const verbrauch = ref(23.5)
const produktion = ref(0)
const grid = ref(23.5)

let t: any
onMounted(()=>{
  // 模拟实时变化
  t = setInterval(()=>{
    const delta = (Math.random()-0.5) * 0.8
    verbrauch.value = Math.max(0, verbrauch.value + delta)
    produktion.value = Math.max(0, produktion.value + (Math.random()-0.5) * 0.5)
    grid.value = Math.max(0, verbrauch.value - produktion.value)
    autarkie.value = Math.min(100, (produktion.value / (verbrauch.value || 1)) * 100)
  }, 1000)
})
onBeforeUnmount(()=> clearInterval(t))
/*
面试官：

系统中我们看到有个「Hinzufügen」按钮，你能解释一下点击这个按钮后发生了什么？
它和配置表单是怎么联动的？

你：

当用户点击右上角的「Hinzufügen」按钮时，会展开一个下拉菜单，包含三项：

Ladepunkt hinzufügen

Ladegruppe hinzufügen

Zähler hinzufügen

我在前端只演示 Ladepunkt hinzufügen，它会跳转到 /add-point 页面。

这个页面渲染一个完整的 表单组件（AddDeviceForm.vue），表单字段和 energielenker 文档里的字段一模一样，比如：

名称（Bezeichnung）

Beschreibung

Kommunikationstyp

Max. Ladeleistung

OCPP Forwarding 参数等

所有字段我都用 v-model 双向绑定，并用 ref() 和 reactive() 管理状态。
*/

const dropdown = ref(false);
const toggleDropdown = () => (dropdown.value = !dropdown.value);
const goTo = (path: string) => router.push('/' + path);

</script>

<style scoped lang="scss">
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--card-bg);
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}
.toggle-theme {
  background: none;
  border: 1px solid var(--fg);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--fg);
}

.actions { 
    position: relative; 
}

.dropdown {
  position: absolute;
  right: 0;
  background: var(--card-bg);
  list-style: none;
  border-radius: 8px;
  padding: 6px;
  box-shadow: var(--shadow-sm);
  li {
    padding: 6px 10px;
    cursor: pointer;
    &:hover { background: var(--muted); color: white; }
  }
}

.header-grid{
  display:grid; grid-template-columns: repeat(4, 1fr); gap:12px;
}
.kpi{
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px; padding: 12px;
  .label{ color: var(--muted); font-size: 12px; }
  .value{ font-size: 22px; font-weight: 700; }
}
@media (max-width: 768px){ .header-grid{ grid-template-columns: repeat(2,1fr);} }
</style>
