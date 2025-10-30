<script setup lang="ts">
import { reactive, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

/*
面试官追问：

那进入这个新增页面以后，你怎么实现“表单验证”和“草稿保存”的？

你：

表单加载时会先读取本地缓存（localStorage），如果之前用户输入过内容没提交，就自动恢复。
每次输入字段时，数据都会被 watch 监听并写入草稿缓存。
提交按钮点击时执行简单验证，验证通过后用 Mock API 模拟提交（写入 mock/devices.json）。
*/

const router = useRouter();

interface FormData {
  name: string;
  description: string;
  maxPower: number;
  type: string;
  ocppUrl: string;
}

const form = reactive<FormData>({
  name: '',
  description: '',
  maxPower: 22,
  type: 'AC',
  ocppUrl: '',
});

/*
面试官追问：

如果用户输入到一半没点“Speichern”直接离开页面，再回来还能恢复吗？

你：

可以。我用了 watch(form, deep: true) 自动写入 localStorage。
离开页面时没清除草稿，回到页面时就会读取 formDraft 自动恢复。
这模拟了一个真实企业配置系统的草稿机制。
*/

// 草稿恢复
const saved = localStorage.getItem('formDraft');
if (saved) Object.assign(form, JSON.parse(saved));

// 实时保存草稿
watch(form, (val) => localStorage.setItem('formDraft', JSON.stringify(val)), { deep: true });

// 提交验证
const submit = async () => {
  if (!form.name.trim()) return alert('Bezeichnung ist Pflichtfeld!');
  await axios.post('/api/devices.json', form); // mock，真实后端会换成 POST 接口
  localStorage.removeItem('formDraft');
  alert('Ladepunkt erfolgreich hinzugefügt!');
  router.push('/');
};

/*
面试官追问：

如果用户输入到一半没点“Speichern”直接离开页面，再回来还能恢复吗？

你：

可以。我用了 watch(form, deep: true) 自动写入 localStorage。
离开页面时没清除草稿，回到页面时就会读取 formDraft 自动恢复。
这模拟了一个真实企业配置系统的草稿机制。

面试官总结：

很好，你的配置表单逻辑完整：

有输入验证；

自动草稿保存；

Mock 写入并刷新展示；

样式和官方界面相符。

你总结：

对，这一题我想展示的是：

我不仅能做静态表单，还能做「有状态的配置系统」。

技术要点包括：

Composition API 里的 reactive() 管理表单状态；

watch() 实现草稿同步；

Mock API 模拟数据流；

Vuex action 负责刷新前端列表；

逻辑与 energielenker 的配置场景一一对应。

*/
</script>

<template>
  <div class="add-page">
    <h3>Neuer Ladepunkt</h3>
    <form @submit.prevent="submit">
      <label>Bezeichnung *</label>
      <input v-model="form.name" placeholder="Name des Geräts" />

      <label>Beschreibung</label>
      <input v-model="form.description" />

      <label>Max. Ladeleistung (kW)</label>
      <input v-model.number="form.maxPower" type="number" />

      <label>Kommunikation</label>
      <select v-model="form.type">
        <option value="AC">AC</option>
        <option value="DC">DC</option>
      </select>

      <label>OCPP Forwarding URL</label>
      <input v-model="form.ocppUrl" placeholder="z.B. https://backend.ocpp.de" />

      <button type="submit">Speichern</button>
    </form>
  </div>
</template>

<style scoped lang="scss">
.add-page {
  background: var(--card-bg);
  padding: 20px;
  border-radius: 12px;
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
label { font-weight: 600; }
input, select {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
}
button {
  margin-top: 12px;
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
}
</style>
