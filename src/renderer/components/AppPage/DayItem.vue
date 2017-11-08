<template>
  <li class="day-list-item">
    <h2 class="day-item-title" @click="addNewItem">{{day.text}}요일 - {{day.number}}일</h2>
    <!-- Empty State -->
    <input type="text" @focus="addNewItem" @click="addNewItem" v-if="itemsNotExists">
    <!--  -->
    <template v-if="itemsExists">
      <div v-for="item in items" :key="item.id">
        <input type="checkbox">
        <input type="text"
          autofocus
          v-model="item.text"
          :ref="`input-${item.id}`"
          :key="item.id"
          @focus="focus(item)"
          @keyup.up="moveItemUp(true, item)"
          @keyup.down="moveItemUp(false, item)"
          @keyup.enter="handleEnter"
          @keyup.delete.prevent="removeItem(item)"
          @keydown.tab.prevent="toggleDoneItem"
        >
      </div>
    </template>
  </li>
</template>

<script>
export default {
  props: {
    day: {
      type: Object,
      require: true
    }
  },
  data: function () {
    return {
      currentItem: null
    }
  },
  computed: {
    items: function () {
      return this.day.items
    },
    itemCount: function () {
      return this.items.length
    },
    itemsExists: function () {
      return this.items.length > 0
    },
    itemsNotExists: function () {
      return !this.itemsExists
    }
  },
  methods: {
    focus: function (item) {
      this.currentItem = item
    },
    handleEnter: function () {
      if (event.shiftKey) {
        this.addItemNote()
      } else {
        this.addNewItem()
      }
    },
    addNewItem: function () {
      // Message
      let tailText = ''
      let itemIndex = -1
      if (this.currentItem !== null) {
        const caretPosition = this.getCaretPosition()
        const textLength = this.currentItem.text.length
        let remainText = this.currentItem.text
        if (caretPosition !== textLength) {
          remainText = this.currentItem.text.slice(0, caretPosition)
          tailText = this.currentItem.text.slice(caretPosition, textLength)
        }
        itemIndex = this.getItemIndex(this.currentItem)
        if (itemIndex !== -1) {
          this.$emit('updateItemText', this.day, this.currentItem, remainText)
        }
      }

      const day = Object.assign({}, this.day)
      this.$emit('addItem', day, itemIndex, tailText)

      document.activeElement.blur()

      this.$nextTick(() => {
        const id = `input-${this.items[itemIndex + 1].id}`
        const input = this.$refs[id][0]
        input.focus()
      })
    },
    removeItem: function (item) {
      if (this.getCaretPosition() === 0) {
        this.$emit('removeItem', this.day, item)
      }
    },
    toggleDoneItem: function () {
      const day = Object.assign({}, this.day)
      this.$emit('toggleDone', day)
    },
    addItemNote: function (item) {
      console.log('addItemNote')
    },
    moveItemUp: function (isUp, item) {
      const currentIndex = this.getItemIndex(item)
      const isFirst = (isUp && currentIndex === 0)
      const isLast = (!isUp && currentIndex === this.itemCount - 1)
      const isFirstOrLast = isFirst || isLast

      if (isFirstOrLast) {
        console.log('처음 혹은 마지막')
        return
      }

      const nextIndex = isUp ? currentIndex - 1 : currentIndex + 1
      const nextItem = this.items[nextIndex]
      const nextRef = `input-${nextItem.id}`
      const input = this.$refs[nextRef][0]
      input.focus()
    },
    getItemIndex: function (targetItem) {
      return this.items.findIndex(item => {
        return item.id === targetItem.id
      })
    },
    getCaretPosition: function () {
      const el = document.activeElement
      const val = el.value
      return val.slice(0, el.selectionStart).length
    }
  }
}
</script>

<style>
/* Day List */
.day-list-item.today {

}

.day-list-item.today .day-item-title {
  border-bottom: 1px solid black;
}

.day-item-title {
  cursor: pointer;
}
</style>
