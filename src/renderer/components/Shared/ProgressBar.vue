<template>
  <div
    class="progress-wrapper"
    v-if="downloading">
    <div class="progress" :style="{ width: progressWidth }"></div>
  </div>
</template>

<script>
export default {
  props: {
    downloading: {
      type: Boolean,
      required: true,
      default: false
    },
    percent: {
      type: Number,
      required: true,
      default: 0
    }
  },
  computed: {
    progressWidth: function () {
      return this.percent + '%'
    }
  }
}
</script>

<style>

</style>
