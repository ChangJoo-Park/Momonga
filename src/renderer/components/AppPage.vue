<template>
  <div id="wrapper">
    <nav-bar></nav-bar>
    <main>
    </main>
    <!-- Setting -->
    <!-- Setting Button -->
    <!-- Setting Modal -->
    <button 
      class="button-setting"
      @click="isSettingOpened = true"
    >O</button>
    <setting-modal
      v-if="isSettingOpened"
      @close="isSettingOpened = false"
    ></setting-modal>
  </div>
</template>

<script>
  import NavBar from './AppPage/NavBar'
  import SettingModal from './AppPage/SettingModal'

  export default {
    name: 'app-page',
    components: {
      NavBar,
      SettingModal
    },
    data: function () {
      return {
        isSettingOpened: false
      }
    },
    methods: {
    }
  }
</script>

<style>

</style>
