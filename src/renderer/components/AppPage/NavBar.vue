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
import { format } from 'date-fns'
import koLocale from 'date-fns/locale/ko'

export default {
  props: {
    currentWeek: {
      type: Object,
      required: true
    }
  },
  computed: {
    lastWeek: function () {
      return `${this.currentWeek.year} ${this.currentWeek.week}`
    },
    thisWeek: function () {
      const options = {
        locale: koLocale
      }
      const start = format(this.currentWeek.start, 'D', options)
      const end = format(this.currentWeek.end, 'D', options)
      const month = format(this.currentWeek.date, 'MMM', options)
      return `${start} - ${end} ${month}`
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
  font-size: 20px;
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
