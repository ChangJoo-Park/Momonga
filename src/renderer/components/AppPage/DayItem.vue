<template>
  <li class="day-list-item">
    <h2 class="day-item-title" @click="addNewItem">{{day.text}}요일 - {{day.number}}일</h2>
    <!-- Empty State -->
    <input type="text" @click="addNewItem" v-if="itemsNotExists">
    <!--  -->
    <template v-if="itemsExists">
      <div v-for="item in items" :key="item.id">
        <input type="checkbox">
        <input type="text"
          v-model="item.text" 
          @keyup.enter="addNewItem" 
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
      this.$emit('addItem', day)
    },
    toggleDoneItem: function () {
      const day = Object.assign({}, this.day)
      this.$emit('toggleDone', day)
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
