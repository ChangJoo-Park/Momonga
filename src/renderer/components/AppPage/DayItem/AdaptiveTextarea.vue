<template>
  <textarea
  :value="source"
  class="textarea"
  @input="$emit('update:source', $event.target.value)"
  :rows="currentRows"
  ></textarea>
</template>

<script>
export default {
  name: 'adaptive-textarea',
  props: {
    source: {
      type: String
    }
  },
  data: function () {
    return {
      minRows: 1,
      maxRows: 20,
      currentRows: 1,
      baseScrollHeight: -1,
      fontSize: 1
    }
  },
  mounted: function () {
    this.baseScrollHeight = this.$el.scrollHeight
    this.currentRows = this.minRows
    this.fontSize = this.getCurrentFontSize()
    this.$el.focus()
  },
  watch: {
    source: function () {
      this.updateRows()
    }
  },
  methods: {
    updateRows: function () {
      if (this.source === '') {
        this.currentRows = this.minRows
        return
      }
      let rows = Math.ceil((this.$el.scrollHeight - this.baseScrollHeight) / this.fontSize)

      if (rows > this.maxRows) {
        rows = this.maxRows
      } else if (rows < this.minRows) {
        rows = this.minRows
      }
      this.currentRows = rows
    },
    getCurrentFontSize: function () {
      return parseInt(window.getComputedStyle(this.$el).getPropertyValue('font-size'))
    }
  }
}
</script>

<style>

</style>
