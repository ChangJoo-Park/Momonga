<template>
  <li class="day-list-item" :key="day.id">
    <div>
      <h2 class="day-item-title" @click="addNewItemWithEmpty">{{day.text}} - {{day.number}}</h2>
    </div>
    <!-- Empty State -->
    <input class="dummy-text-input" type="text" @focus="addNewItemWithEmpty" @click="addNewItem" v-if="itemsNotExists">
    <!--  -->
    <template v-if="itemsExists">
      <div v-for="item in items" :key="item.id" :class=" { 'done': item.isDone }">
        <div class="day-item">
          <div class="day-item-checkbox" @click="toggleDoneItem(item)">
            <span v-if="item.isDone" :key="`item-${item.id}-done`">	&#9679;</span>
            <span v-else :key="`item-${item.id}-notdone`">&#9675;</span>
          </div>
          <textarea type="text"
            class="day-item-input"
            autofocus
            rows="1"
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
        <div v-if="item.note">
          <textarea
          class="day-item-note"
          v-model="item.note.body"
          :ref="`note-${item.note.id}`"
          @keydown.tab.prevent="toggleDoneItem(item)"
          @keydown.delete="removeNote(item)"
          ></textarea>
        </div>
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
    },
    currentItemTextLength: function () {
      if (this.currentItem === undefined) {
        return 0
      }
      return this.currentItem.text.length
    },
    currentItemIndex: function () {
      return this.day.items.findIndex(i => this.currentItem.id === i.id)
    }
  },
  methods: {
    // 전달받은 item에 포커스가 되도록 한다.
    focusItem: function (item) {
      if (item === undefined) {
        return
      }
      document.activeElement.blur()
      this.$nextTick(_ => {
        const id = `input-${item.id}`
        const input = this.$refs[id][0]
        input.focus()
      })
    },
    /**
     * 엔터키 처리
     * 엔터키만 입력한 경우 : 새 아이템을 추가
     * 쉬프트와 함께 입력한 경우 : 아이템의 노트 추가
     */
    handleEnter: function () {
      if (event.shiftKey) {
        this.addItemNote()
      } else {
        this.addNewItem()
      }
    },
    /**
     * 날짜 / 빈칸을 눌러서 만드는 경우에는 아무 내용 없이 아이템을 만들어야함
     */
    addNewItemWithEmpty: function () {
      this.$emit('addItem', this.day, -1, '')
      this.focusItem(this.lastItem)
    },
    /**
     * 아이템이 선택된 경우만 작동함
     */
    addNewItem: function () {
      // Message
      const caretPosition = this.getCaretPosition()
      const isCaretPositionMiddle = caretPosition !== this.currentItemTextLength

      let tailText = ''
      let remainText = this.currentItem.text

      if (isCaretPositionMiddle) {
        remainText = this.currentItem.text.slice(0, caretPosition)
        tailText = this.currentItem.text.slice(caretPosition, this.currentItemTextLength)
      }

      this.$emit('updateItemText', this.day, this.currentItem, remainText)

      const day = Object.assign({}, this.day)
      this.$emit('addItem', day, this.currentItemIndex, tailText)

      this.focusItem(this.items[this.currentItemIndex + 1])
    },
    /**
     * 삭제 후 어떤 아이템이 선택되어야하는지 결정
     * 첫번째 아이템이고 두개 이상인 경우 0번 인덱스가 다음 포커스 아이템
     * 중간 아이템인 경우 현재 아이템에서 하나 뺀 인덱스
     * 마지막인 경우 맨 마지막을 선택
     */
    findNextItemIndex: function (item) {
      const itemIndex = this.items.findIndex(i => i.id === item.id)
      const isFirstItemAndMoreThanOne = itemIndex === 0 && this.itemCount !== 0
      const isMiddleItemAndMoreThanEqualOne = (itemIndex === this.itemCount - 1) && (this.itemCount - 1 >= 1)
      let nextIndex = -1

      if (isFirstItemAndMoreThanOne) {
        nextIndex = 0
      } else if (isMiddleItemAndMoreThanEqualOne) {
        nextIndex = this.itemCount - 2
      } else {
        nextIndex = itemIndex - 1
      }
      return nextIndex
    },
    /**
     * 캐럿 포지션이 0이고 텍스트가 0개일때 아이템을 삭제한다
     */
    removeItem: function (item) {
      const nextIndex = this.findNextItemIndex(item)

      const isCaretPositionZeroAndEmptyText = this.getCaretPosition() === 0 && item.text.length === 0
      if (isCaretPositionZeroAndEmptyText) {
        this.$emit('removeItem', this.day, item)
        this.focusItem(this.items[nextIndex])
      }
    },
    removeNote: function () {
      if (this.currentItem.note.body.length === 0) {
        this.$set(this.currentItem, 'note', null)
        this.focusItem(this.currentItem)
      }
    },
    /**
     * 전달받은 아이템의 완료 상태를 토글
     */
    toggleDoneItem: function (item) {
      const day = Object.assign({}, this.day)
      this.$emit('toggleDone', day, item)
    },
    /**
     * 아이템에 노트를 추가함 (최대 1개)
     */
    addItemNote: function () {
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
        input.focus()
      })
    },
    /**
     * 아이템의 다음 포커스 상태를 선택한다
     */
    moveItemUp: function (isUp, item) {
      const isFirst = (isUp && this.currentItemIndex === 0)
      const isLast = (!isUp && this.currentItemIndex === this.itemCount - 1)
      const isFirstOrLast = isFirst || isLast

      if (isFirstOrLast) {
        console.log('처음 혹은 마지막은 다음 날짜로 이동한다')
        return
      }

      const nextIndex = isUp ? this.currentItemIndex - 1 : this.currentItemIndex + 1
      const nextItem = this.items[nextIndex]
      this.focusItem(nextItem)
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
}
.day-item-input {
  font-size: 15px;
  width: 100%;
  margin: 5px;
  border: none;
  outline: none;
  resize: none;
}

.day-item-note {
  color: #4fc08d;
  font-size: 12px;
  width: 100%;
  margin: 5px;
  border: none;
  outline: none;
  resize: none;
}
</style>
