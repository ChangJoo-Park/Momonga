<template>
  <div class="modal full-modal background-white">
    <!-- Closer -->
    <i class="la la-2x la-close position-fixed top-right modal-closer button-icon" @click="handleClose"></i>
    <select v-model="selectedLocale">
      <option v-for="locale in locales" :value="locale.value" :key="locale.value">
        {{locale.text}}
      </option>
    </select>
  </div>
</template>

<script>
import util from '../../util'

export default {
  mounted: function () {
    const currentLocale = util.getCurrentLocale()
    const optionIndex = this.locales.findIndex(l => l.value === currentLocale)
    this.selectedLocale = this.locales[optionIndex].value
  },
  data: function () {
    return {
      selectedLocale: '',
      locales: [
        { text: 'English', value: 'en' },
        { text: '한국어', value: 'ko' },
        { text: '日本語', value: 'ja' },
        { text: '简体中文', value: 'zh_cn' },
        { text: 'Spanish', value: 'es' }
      ]
    }
  },
  methods: {
    handleClose: function () {
      let isChanged = util.getCurrentLocale() !== this.selectedLocale
      if (isChanged) {
        util.setCurrentlocale(this.selectedLocale)
      }
      this.$emit('close', isChanged)
    }
  }
}
</script>

<style lang="scss">
.full-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.modal-closer {
  margin-top: 5px;
  margin-right: 5px;
}
</style>
