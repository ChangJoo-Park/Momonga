<template>
  <div class="nav-wrapper">
    <div class="nav-item nav-item-left" @click="$emit('goLastWeek')">
      <span class="nav-item-arrow"><</span>
      <span class="nav-item-text active">{{ lastWeek }}</span>
    </div>
    <div class="nav-item nav-item-right" @click="$emit('goNextWeek')">
      <span class="nav-item-text">{{ thisWeek }}</span>
      <span class="nav-item-arrow">></span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    currentWeek: {
      type: Object,
      required: true
    }
  },
  computed: {
    lastWeek: function () {
      const lastWeek = this.$S.Date(this.currentWeek.today.raw).get('last week')
      const lastWeekNumber = lastWeek.getISOWeek().raw + 1
      const lastWeekYear = lastWeek.format('{yyyy}')
      return `${lastWeekYear} ${lastWeekNumber}`
    },
    thisWeek: function () {
      const beginString = this.$S.Date(this.currentWeek.begin).format('{d}').raw
      const endString = this.$S.Date(this.currentWeek.end).format('{d}').raw
      const monthString = this.$S.Date(this.currentWeek.end).format('{M}').raw
      return `${beginString} - ${endString} ${monthString}월`
    }
  }
}
</script>

<style>
.nav-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 30px;
  margin-bottom: 10px;
}
.nav-item-text, .nav-item-arrow {
  font-size: 30px;
}

.nav-item {
  user-select: none;
  cursor: pointer;
}

.nav-item-text.active {
  color: #4fc08d;
}
.nav-item-arrow {
  color: #4fc08d;
}
</style>
