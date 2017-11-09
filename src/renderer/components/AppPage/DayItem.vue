<template>
  <li class="day-list-item">
    <div>
      <h2 class="day-item-title" @click="addNewItemWithEmpty">{{day.text}}요일 - {{day.number}}일</h2>
    </div>
    <!-- Empty State -->
    <input class="dummy-text-input" type="text" @focus="addNewItemWithEmpty" @click="addNewItem" v-if="itemsNotExists">
    <!--  -->
    <template v-if="itemsExists">
      <div class="day-item" v-for="item in items" :key="item.id" :class=" { 'done': item.isDone }">
        <div class="day-item-checkbox" @click="toggleDoneItem(item)">
          <span v-if="item.isDone" :key="`item-${item.id}-done`">	&#9679;</span>
          <span v-else :key="`item-${item.id}-notdone`">&#9675;</span>
        </div>
        <textarea type="text"
          class="day-item-input"
          rows=1
          autofocus
          v-model="item.text"
          :ref="`input-${item.id}`"
          :key="item.id"
          @focus="currentItem = item"
          @keydown.up.prevent="moveItemUp(true, item)"
          @keydown.down.prevent="moveItemUp(false, item)"
          @keydown.enter.prevent="handleEnter"
          @keydown.delete="removeItem(item)"
          @keydown.tab.prevent="toggleDoneItem(item)"
        ></textarea>
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
    },
    lastItem: function () {
      return this.items[this.itemCount - 1]
    }
  },
  methods: {
    focusItem: function (item) {
      this.$nextTick(_ => {
        const id = `input-${item.id}`
        const input = this.$refs[id][0]
        input.focus()
      })
    },
    handleEnter: function () {
      if (event.shiftKey) {
        this.addItemNote()
      } else {
        this.addNewItem()
      }
    },
    addNewItemWithEmpty: function () {
      this.$emit('addItem', this.day, -1, '')
      this.focusItem(this.lastItem)
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
      this.focusItem(this.items[itemIndex + 1])
    },
    removeItem: function (item) {
      const itemIndex = this.items.findIndex(i => i.id === item.id)
      console.log(itemIndex)
      let nextIndex = -1
      if (itemIndex === 0 && this.items.length !== 0) {
        nextIndex = 0
      } else if ((itemIndex === this.items.length - 1) && (this.items.length - 1 >= 1)) {
        nextIndex = this.items.length - 2
      } else {
        nextIndex = itemIndex - 1
      }
      console.log('nextIndex = ', nextIndex)
      if (this.getCaretPosition() === 0 && item.text.length === 0) {
        this.$emit('removeItem', this.day, item)
        this.focusItem(this.items[nextIndex])
      }
    },
    toggleDoneItem: function (item) {
      const day = Object.assign({}, this.day)
      this.$emit('toggleDone', day, item)
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
      if (el.nodeName === 'BODY') {
        return
      }
      const val = el.value
      return val.slice(0, el.selectionStart).length
    }
  }
}
</script>

<style>
/* Day List */
.day-item-title {
  display: inline-block;
  cursor: pointer;
  margin: 0;
}

.day-item-checkbox {
  user-select: none;
  cursor: pointer;
  font-size: 30px;
  color: #4fc08d;
}

.day-list-item.today .day-item-title {
  border-bottom: 1px solid black;
}

.day-list-item .done .day-item-input{
  text-decoration:line-through;
}

.dummy-text-input {
  outline: none;
  border: none;
  width: 100%;
}

.day-item {
  display: flex;
}
.day-item-input {
  width: 100%;
  margin: 5px;
}
</style>
