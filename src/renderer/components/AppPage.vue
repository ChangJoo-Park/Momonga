<template>
  <div id="wrapper">
    <nav-bar
      :currentWeek="currentWeek"
      @goLastWeek="moveLastWeek"
      @goNextWeek="moveNextWeek"
    ></nav-bar>
    <main>
      <transition name="list" tag="div" mode="out-in" appear>
        <day-list :key="today">
          <day-item
            v-for="day in currentWeekDays"
            :day="day"
            :key="day.number"
            @addItem="addItemToDay"
            @removeItem="removeItem"
            @updateItemText="updateItemText"
            @toggleDone="doneItem"
          ></day-item>
        </day-list>
      </transition>
    </main>
    <!-- Setting -->
    <!-- Setting Button -->
    <button
      class="button button-setting position-fixed bottom-right"
      @click="isSettingOpened = true"
    >O</button>
    <!-- Setting Modal -->
    <setting-modal
      v-if="isSettingOpened"
      @close="isSettingOpened = false"
    ></setting-modal>
  </div>
</template>

<script>
import uuid from 'uuid/v4'
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
        console.log(koLocale)
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
            console.log(docs)
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
    addItemToDay: function (day, itemIndex = -1, text = '') {
      console.log('아이템 추가')
      const targetIndex = this.findItemByProperty(this.currentWeekDays, day, 'id')
      if (targetIndex === -1) {
        return
      }
      const newItem = {
        _id: uuid(),
        text: text,
        isDone: false,
        date: day.date,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      console.log('newItem => ', newItem)
      this.$db.put(newItem)
        .then(response => {
          console.log(response)
          if (itemIndex === -1) {
            console.log('새로 만듬')
            this.currentWeekDays[targetIndex].items.push(newItem)
          } else {
            console.log('중간에 만듬')
            this.currentWeekDays[targetIndex].items.splice(itemIndex + 1, 0, newItem)
          }
        })
        .catch(error => {
          console.log(error)
        })
    },
    removeItem: function (day, item) {
      const dayIndex = this.findItemByProperty(this.currentWeekDays, day, 'id')
      const itemIndex = this.findItemByProperty(this.currentWeekDays[dayIndex].items, item, '_id')
      if (dayIndex === -1 || itemIndex === -1) {
        return
      }
      this.$db.get(item._id).then(doc => {
        this.currentWeekDays[dayIndex].items.splice(itemIndex, 1)
        return this.$db.remove(doc)
      })
    },
    updateItemText: function (day, item, text = '') {
      console.log('update item text')
      const dayIndex = this.findItemByProperty(this.currentWeekDays, day, 'id')
      const itemIndex = this.findItemByProperty(this.currentWeekDays[dayIndex].items, item, '_id')
      if (dayIndex === -1 || itemIndex === -1) {
        return
      }
      this.currentWeekDays[dayIndex].items[itemIndex].text = text
    },
    doneItem: function (day, item) {
      const dayIndex = this.findItemByProperty(this.currentWeekDays, day, 'id')
      const itemIndex = this.findItemByProperty(this.currentWeekDays[dayIndex].items, item, '_id')
      if (dayIndex === -1 || itemIndex === -1) {
        return
      }
      this.currentWeekDays[dayIndex].items[itemIndex].isDone = !this.currentWeekDays[dayIndex].items[itemIndex].isDone
    },
    findItemByProperty: function (collection, item, property) {
      var targetIndex = -1
      for (var index = 0; index < collection.length; index++) {
        if (collection[index][property] === item[property]) {
          targetIndex = index
          break
        }
      }
      return targetIndex
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

#wrapper {
  overflow: hidden;
}
</style>
