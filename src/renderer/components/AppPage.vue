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
  import NavBar from './AppPage/NavBar'
  import SettingModal from './AppPage/SettingModal'
  import DayList from './AppPage/DayList'
  import DayItem from './AppPage/DayItem'

export default {
    name: 'app-page',
    components: {
      NavBar,
      SettingModal,
      DayList,
      DayItem
    },
    created: function () {
      const date = new this.$S.Date()
      this.setCurrentWeek(date)
      this.currentWeekDays = this.getCurrentWeekDays()
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
        console.log(this.currentWeek.today.raw)
        return this.currentWeek.today.raw + ''
      }
    },
    methods: {
      getCurrentWeekDays: function () {
        const begin = JSON.parse(JSON.stringify(this.currentWeek.begin))
        const startDay = new this.$S.Date(begin)
        const weekDays = []
        for (let index = 0; index < 7; index++) {
          const id = Math.floor(Math.random() * 99999)
          weekDays.push({
            id: id,
            text: startDay.format('{Weekday}').raw,
            number: startDay.format('{d}').raw,
            items: []
          })
          startDay.addDays(1)
        }
        return weekDays
      },
      moveLastWeek: function () {
        console.log('move last week current week => ', this.currentWeek)
        const date = new this.$S.Date(this.currentWeek.today.raw).get('last week')
        this.setCurrentWeek(date)
      },
      moveNextWeek: function () {
        console.log('move next week')
        const date = new this.$S.Date(this.currentWeek.today.raw).get('next week')
        this.setCurrentWeek(date)
      },
      setCurrentWeek: function (date) {
        const beginDay = date.get('sunday').raw
        const endDay = date.get('saturday').raw
        this.currentWeek = {
          today: date,
          begin: beginDay,
          end: endDay,
          weekNumber: date.getISOWeek().raw
        }
        this.currentWeekDays = this.getCurrentWeekDays()
      },
      addItemToDay: function (day, itemIndex = -1, text = '') {
        const targetIndex = this.findItemByProperty(this.currentWeekDays, day, 'id')
        const newItem = { id: Math.floor(Math.random() * 99999), text: text, isDone: false }
        if (targetIndex === -1) {
          return
        }
        if (itemIndex === -1) {
          this.currentWeekDays[targetIndex].items.push(newItem)
        } else {
          this.currentWeekDays[targetIndex].items.splice(itemIndex + 1, 0, newItem)
        }
      },
      removeItem: function (day, item) {
        const dayIndex = this.findItemByProperty(this.currentWeekDays, day, 'id')
        const itemIndex = this.findItemByProperty(this.currentWeekDays[dayIndex].items, item, 'id')
        if (dayIndex === -1 || itemIndex === -1) {
          return
        }
        this.currentWeekDays[dayIndex].items.splice(itemIndex, 1)
      },
      updateItemText: function (day, item, text = '') {
        const dayIndex = this.findItemByProperty(this.currentWeekDays, day, 'id')
        const itemIndex = this.findItemByProperty(this.currentWeekDays[dayIndex].items, item, 'id')
        if (dayIndex === -1 || itemIndex === -1) {
          return
        }
        this.currentWeekDays[dayIndex].items[itemIndex].text = text
      },
      doneItem: function (day, item) {
        const dayIndex = this.findItemByProperty(this.currentWeekDays, day, 'id')
        const itemIndex = this.findItemByProperty(this.currentWeekDays[dayIndex].items, item, 'id')
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
  transform: translateX(50px);
}
</style>
