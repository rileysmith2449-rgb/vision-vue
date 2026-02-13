import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const dataSource = ref(localStorage.getItem('vision-dataSource') || 'demo')

  function setDataSource(source) {
    dataSource.value = source
    localStorage.setItem('vision-dataSource', source)
  }

  return { dataSource, setDataSource }
})
