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
          ref="input"
          @keyup.enter="addNewItem" 
          @keyup.delete.prevent="removeItem(item)"
          @keydown.tab.prevent="toggleDoneItem"
          @keyup.shift.enter.prevent="addItemNote(item)"
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
  computed: {
    items: function () {
      return this.day.items
    },
    itemsExists: function () {
      return this.items.length > 0
    },
    itemsNotExists: function () {
      return !this.itemsExists
    }
  },
  methods: {
    addNewItem: function () {
      const day = Object.assign({}, this.day)
      document.activeElement.blur()
      this.$emit('addItem', day)
      this.$nextTick(() => {
        const index = this.items.length - 1
        const input = this.$refs.input[index]
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
