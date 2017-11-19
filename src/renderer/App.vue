<template>
  <div id="app">
    <router-view></router-view>
    <progress-bar :downloading="isDownloading" :percent="downloadPercentage"></progress-bar>
    <update-notification
    :downloaded="isUpdateDownloaded"
    @closeUpdate="isUpdateDownloaded = false"
    ></update-notification>
  </div>
</template>

<script>
import UpdateNotification from './components/Shared/UpdateNotification'
import ProgressBar from './components/Shared/ProgressBar'

export default {
  name: 'momonga',
  components: {
    UpdateNotification,
    ProgressBar
  },
  mounted: function () {
    this.initUpdateRenders()
  },
  data: function () {
    return {
      isUpdateDownloaded: false,
      isDownloading: false,
      downloadPercentage: 0
    }
  },
  methods: {
    initUpdateRenders: function () {
      this.$electron.ipcRenderer.on('available', (event, message) => {
        console.log('available')
        console.log(message)
      })
      this.$electron.ipcRenderer.on('failed', (event, message) => {
        console.log('failed')
        console.log(message)
      })
      this.$electron.ipcRenderer.on('downloaded', (event, message) => {
        console.log('downloaded')
        console.log(message)
        this.isDownloading = false
        this.isUpdateDownloaded = true
      })
      this.$electron.ipcRenderer.on('error', (event, message) => {
        console.log('error')
        console.log(message)
      })
      this.$electron.ipcRenderer.on('download-progress', (event, progress) => {
        console.log('download-progress')
        console.log(progress)
        this.isDownloading = true
        this.downloadPercentage = progress.percent
      })
    }
  }
}
</script>

<style lang="scss">
@import url('./assets/line-awesome/css/line-awesome-font-awesome.min.css');
@import url('./assets/line-awesome/css/line-awesome.min.css');

/* CSS */
* {
  font-family: sans-serif;
}
html, body {
  margin: 0;
  padding: 0;
}
.progress-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background-color: #fff;
}

.progress {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #4fc08d;
  transition: width 0.6s;
}

.notification-update {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 10px;
  background: #fff;
  display: flex;
  justify-content: space-around;
}
</style>