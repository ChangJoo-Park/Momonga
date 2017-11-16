<template>
  <div class="notification-update" v-if="downloaded">
    <span>It's time to fly to next step!</span>
    <div>
      <button @click="installUpdate">Quit and Update</button>
      <button @click="closeUpdate">Close</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    downloaded: {
      type: Boolean,
      default: false,
      required: true
    }
  },
  methods: {
    installUpdate: function () {
      this.$electron.ipcRenderer.sendSync('quit-and-install', '')
    },
    closeUpdate: function () {
      this.$emit('closeUpdate')
    }
  }
}
</script>

<style>

</style>
