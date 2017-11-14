<template>
  <div class="modal full-modal background-white">
    <i class="la la-2x la-close position-fixed top-right modal-closer button-icon" @click="$emit('close')"></i>
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
.modal-closer {
  margin-top: 5px;
  margin-right: 5px;
}
</style>
