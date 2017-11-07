<template>
  <div class="modal full-modal background-white">
    SettingModal
    <button
      class="button-close position-fixed top-right"
      @click="$emit('close')"
    >X</button>
  </div>
</template>

<script>
export default {

}
</script>

<style>
.full-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
