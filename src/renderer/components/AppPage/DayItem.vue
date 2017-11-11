<template>
  <li class="day-list-item" :key="day.id">
    <div>
      <h2 class="day-item-title" @click="addNewItemWithEmpty">{{day.text}} - {{day.number}}</h2>
    </div>
    <!-- Empty State -->
    <input class="dummy-text-input" type="text" @focus="addNewItemWithEmpty" v-if="itemsNotExists">
    <template v-if="itemsExists">
      <div v-for="item in items" :key="item.id" :class=" { 'done': item.isDone }">
        <div class="day-item">
          <div class="day-item-checkbox" @click="toggleDoneItem(item)">
            <span v-if="item.isDone" :key="`item-${item.id}-done`">	&#9679;</span>
            <span v-else :key="`item-${item.id}-notdone`">&#9675;</span>
          </div>
          <adaptive-textarea
            class="day-item-input"
            :ref="`inputs-${item.id}`"
            :key="item.id"
            :source.sync="item.text"
            @focus.native="changeCurrentItem(item)"
            @keydown.up.native.prevent="moveItemUp(true, item)"
            @keydown.down.native.prevent="moveItemUp(false, item)"
            @keydown.enter.native.prevent="handleEnter"
            @keydown.delete.native="removeItem"
            @keydown.tab.native.prevent="toggleDoneItem(item)"
          ></adaptive-textarea>
        </div>
        <div class="day-item-note-wrapper" v-if="item.note">
          <adaptive-textarea
          class="day-item-note"
          :ref="`note-${item.note.id}`"
          :source.sync="item.note.body"
          @focus.native="changeCurrentItem(item)"
          @keydown.native.tab.prevent="toggleDoneItem(item)"
          @keydown.native.delete="removeNote(item)"
          ></adaptive-textarea>
        </div>
      </div>
    </template>
  </li>
</template>

<script>
import AdaptiveTextarea from './DayItem/AdaptiveTextarea'

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
  components: {
    'adaptive-textarea': AdaptiveTextarea
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
    },
    currentItemTextLength: function () {
      if (this.currentItem === undefined) {
        return 0
      }
      return this.currentItem.text.length
    },
    isCurrentItemTextEmpty: function () {
      return this.currentItemTextLength === 0
    },
    currentItemIndex: function () {
      if (this.currentItem === null || this.currentItem === undefined) {
        return -1
      }
      return this.day.items.findIndex(i => this.currentItem.id === i.id)
    }
  },
  watch: {
    currentItem: function (val) {
      if (val === undefined || val === null) {
        document.activeElement.blur()
        return
      }
      const target = `inputs-${this.currentItem.id}`
      this.$refs[target][0].$el.focus()
    }
  },
  methods: {
    changeCurrentItem: function (item) {
      this.currentItem = item
    },
    addNewItemWithEmpty: function () {
      this.$emit('addItem', this.day, -1, '')
    },
    moveItemUp: function (isUp, item) {
      const isFirst = (isUp && this.currentItemIndex === 0)
      const isLast = (!isUp && this.currentItemIndex === this.itemCount - 1)
      const isFirstOrLast = isFirst || isLast

      if (isFirstOrLast) {
        console.log('처음 혹은 마지막은 다음 날짜로 이동한다')
        return
      }
      const nextIndex = isUp ? this.currentItemIndex - 1 : this.currentItemIndex + 1
      this.currentItem = this.items[nextIndex]
    },
    /**
     * 전달받은 아이템의 완료 상태를 토글
     */
    toggleDoneItem: function (item) {
      const day = Object.assign({}, this.day)
      this.$emit('toggleDone', day, item)
    },
    /**
     * 캐럿 포지션이 0이고 텍스트가 0개일때 아이템을 삭제한다
     */
    removeItem: function () {
      const isEmptyLength = this.isCurrentItemTextEmpty
      const isZeroCaret = this.getCaretPosition() === 0
      if (isEmptyLength && isZeroCaret) {
        const nextIndex = this.findNextItemIndex(this.currentItem)
        this.$emit('removeItem', this.day, this.currentItem)
        if (nextIndex === -1) {
          this.currentItem = null
        } else {
          this.currentItem = this.items[nextIndex]
        }
      }
    },
    removeNote: function () {
      const isCaretPositionZeroAndEmptyText = this.getCaretPosition() === 0 && this.currentItem.note.body.length === 0
      if (isCaretPositionZeroAndEmptyText) {
        this.$set(this.currentItem, 'note', null)
        const target = `inputs-${this.currentItem.id}`
        this.$refs[target][0].$el.focus()
      }
    },
    /**
     * 삭제 후 어떤 아이템이 선택되어야하는지 결정
     * 첫번째 아이템이고 두개 이상인 경우 0번 인덱스가 다음 포커스 아이템
     * 중간 아이템인 경우 현재 아이템에서 하나 뺀 인덱스
     * 마지막인 경우 맨 마지막을 선택
     */
    findNextItemIndex: function (item) {
      const isFirstItem = this.currentItemIndex === 0
      const isLastItem = this.currentItemIndex === this.items.length - 1
      const isOnlyOne = isFirstItem && isLastItem
      if (isOnlyOne) {
        console.log('한개만 있는경우')
        return -1
      }
      const isMoreThanOne = this.itemCount > 1
      if (isFirstItem && isMoreThanOne) {
        console.log('첫번쨰 아이템이면서 한개 이상 있는 경우')
        return this.currentItemIndex
      } else if (isLastItem && isMoreThanOne) {
        console.log('마지막이면서 한개 이상 있는 경우')
        return this.itemCount - 2
      } else {
        return this.currentItemIndex - 1
      }
    },
    /**
     * 현재 선택된 엘리먼트의 캐럿 위치를 찾는다.
     */
    getCaretPosition: function () {
      const el = document.activeElement
      if (el.nodeName === 'BODY') {
        return
      }
      const val = el.value
      return val.slice(0, el.selectionStart).length
    },
    handleEnter: function () {
      if (event.shiftKey) {
        this.addItemNote()
      } else {
        this.addNewItem()
      }
    },
    /**
     * 아이템에 노트를 추가함 (최대 1개)
     */
    addItemNote: function () {
      console.log('add item note')
      let id = -1
      if (this.currentItem.note === undefined) {
        id = Math.floor(Math.random() * 99999)
        this.$set(this.currentItem, 'note', {
          id: id,
          body: ''
        })
      }
      id = this.currentItem.note.id
      this.$nextTick(_ => {
        const target = `note-${id}`
        const input = this.$refs[target][0]
        input.$el.focus()
      })
    },
    /**
     * 아이템이 선택된 경우만 작동함
     */
    addNewItem: function () {
      console.log('add new item')
      // Message
      const caretPosition = this.getCaretPosition()
      const isCaretPositionMiddle = caretPosition !== this.currentItemTextLength

      let tailText = ''
      let remainText = this.currentItem.text

      if (isCaretPositionMiddle) {
        remainText = this.currentItem.text.slice(0, caretPosition)
        tailText = this.currentItem.text.slice(caretPosition, this.currentItemTextLength)
      }
      console.log(tailText)
      this.$emit('updateItemText', this.day, this.currentItem, remainText)
      const day = Object.assign({}, this.day)
      this.$emit('addItem', day, this.currentItemIndex, tailText)
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
  margin-bottom: 5px;
  font-size: 22px;
  font-weight: normal;
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

.day-list-item .done .day-item-input,
.day-list-item .done .day-item-note {
  text-decoration:line-through;
}

.dummy-text-input {
  outline: none;
  border: none;
  width: 100%;
}

.day-item {
  display: flex;
  align-items: center;
}
.day-item-input {
  font-size: 15px;
  width: 100%;
  margin: 0;
  border: none;
  outline: none;
  resize: none;
}

.day-item-note-wrapper {
  margin-bottom: 2px;
}

.day-item-note {
  color: #4fc08d;
  font-size: 12px;
  width: 100%;
  border: none;
  outline: none;
  resize: none;
}
</style>
