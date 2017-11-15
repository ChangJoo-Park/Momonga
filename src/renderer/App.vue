<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'momonga',
  mounted: function () {
    this.$electron.ipcRenderer.on('ping', (event, message) => {
      window.alert('hello')
      console.log(message)
    })
    this.$electron.ipcRenderer.on('available', (event, message) => {
      window.alert('available')
      console.log(message)
    })
    this.$electron.ipcRenderer.on('failed', (event, message) => {
      window.alert('failed')
      console.log(message)
    })
    this.$electron.ipcRenderer.on('downloaded', (event, message) => {
      window.alert('downloaded')
      console.log(message)
    })
    this.$electron.ipcRenderer.on('error', (event, message) => {
      window.alert('error')
      console.log(message)
    })
  }
}
</script>

<style>
@import url('./assets/line-awesome/css/line-awesome-font-awesome.min.css');
@import url('./assets/line-awesome/css/line-awesome.css');

/* CSS */
* {
  font-family: sans-serif;
}
html, body {
  margin: 0;
  padding: 0;
}
</style>
