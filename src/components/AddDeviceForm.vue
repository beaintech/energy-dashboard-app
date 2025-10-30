<script setup lang="ts">
import { reactive, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

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
