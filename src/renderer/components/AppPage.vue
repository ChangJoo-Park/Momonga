<template>
  <div id="wrapper">
    <nav-bar
      class="navbar"
      :currentWeek="currentWeek"
      @goLastWeek="moveLastWeek"
      @goNextWeek="moveNextWeek"
    ></nav-bar>
    <div class="main-wrapper">
      <main id="main">
        <transition name="list" tag="div" mode="out-in" appear>
          <day-list :key="today">
            <day-item
              v-for="day in currentWeekDays"
              :day="day"
              :key="day.number"
            ></day-item>
          </day-list>
        </transition>
      </main>
    </div>
    <!-- Setting -->
    <!-- Setting Button -->
    <i class="la la-sliders la-2x position-fixed bottom-right setting-button button-icon" @click="isSettingOpened = true"></i>
    <!-- Setting Modal -->
    <transition name="modal">
      <setting-modal
        v-if="isSettingOpened"
        @close="isSettingOpened = false"
      ></setting-modal>
    </transition>
  </div>
</template>

<script>
import NavBar from './AppPage/NavBar'
import SettingModal from './AppPage/SettingModal'
import DayList from './AppPage/DayList'
import DayItem from './AppPage/DayItem'
import { getISOYear, getISOWeek, startOfWeek, endOfWeek, addWeeks, subWeeks, format, addDays } from 'date-fns'
import koLocale from 'date-fns/locale/ko'

export default {
  name: 'app-page',
  components: {
    NavBar,
    SettingModal,
    DayList,
    DayItem
  },
  created: function () {
    this.setCurrentWeek(new Date())
  },
  data: function () {
    return {
      isSettingOpened: false,
      currentWeek: null,
      currentWeekDays: null
    }
  },
  computed: {
    today: function () {
      return this.currentWeek.date + ''
    }
  },
  methods: {
    getCurrentWeekDays: function () {
      return new Promise((resolve, reject) => {
        let startDay = this.currentWeek.start
        const weekDays = []
        const promises = []
        for (let index = 0; index < 7; index++) {
          const queryDate = format(startDay, 'YYYY-MM-DD')
          promises.push(this.$db.find({
            selector: {
              date: { $eq: queryDate }
            }
          }))
          startDay = addDays(startDay, 1)
        }
        Promise.all(promises).then(results => {
          let startDay = this.currentWeek.start
          results.forEach(day => {
            const id = Math.floor(Math.random() * 99999)
            const docs = day.docs
            weekDays.push({
              id: id,
              text: format(startDay, 'dddd', { locale: koLocale }),
              number: format(startDay, 'Do', { locale: koLocale }),
              date: format(startDay, 'YYYY-MM-DD'),
              items: docs
            })
            startDay = addDays(startDay, 1)
          })
          resolve(weekDays)
        })
      })
    },
    moveLastWeek: function () {
      const date = subWeeks(this.currentWeek.date, 1)
      this.setCurrentWeek(date)
    },
    moveNextWeek: function () {
      const date = addWeeks(this.currentWeek.date, 1)
      this.setCurrentWeek(date)
    },
    setCurrentWeek: function (date) {
      const start = startOfWeek(date, {weekStartsOn: 0})
      const end = endOfWeek(date, {weekStartsOn: 0})
      const year = getISOYear(date)
      const week = getISOWeek(end)

      this.currentWeek = { date, start, end, year, week }
      this.getCurrentWeekDays().then(result => {
        this.currentWeekDays = result
      })
    },
    goToScrollTop: function () {
      this.$el.scrollTop = 0
    }
  }
}
</script>

<style>
/* Global Styles */
.position-fixed {
  position: fixed;
}

.bottom-right {
  right: 0;
  bottom: 0;
}

.top-right {
  right: 0;
  top: 0;
}

.background-white {
  background: white;
}

.no-style-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.list-item {
  margin-right: 10px;
}

.list-enter-active, .list-leave-active {
  transition: all .4s;
}

.list-enter, .list-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.modal-enter-active, .modal-leave-active {
  transition: all .4s;
}

.modal-enter, .modal-leave-to {
  transform: translateY(100%);
}

#wrapper {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.navbar {
  flex: 0;
}
#main {
  box-sizing: border-box;
  padding: 5px;
}
.setting-button {
  margin-right: 5px;
  margin-bottom: 5px;
}

.button-icon {
  color: #4fc08d;
  cursor: pointer;
}
.button-icon:hover {
  color: #000;
}

</style>
