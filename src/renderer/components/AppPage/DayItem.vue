<template>
  <li class="day-list-item" :key="day.id">
    <div>
      <h2 class="day-item-title" @click="addNewItemWithEmpty">{{day.text}} - {{day.number}}</h2>
    </div>
    <!-- Empty State -->
    <input class="dummy-text-input" type="text" @focus="addNewItemWithEmpty" v-if="itemsNotExists">
    <template v-if="itemsExists">
      <div v-for="item in sortedByOrderItems" :key="item._id" :class=" { 'done': item.isDone }">
        <div class="day-item">
          <div class="day-item-checkbox" @click="toggleDoneItem(item)">
            <span v-if="item.isDone" :key="`item-${item._id}-done`">	&#9679;</span>
            <span v-else :key="`item-${item._id}-notdone`">&#9675;</span>
          </div>
          <textarea-autosize
            class="day-item-input"
            :ref="`inputs-${item._id}`"
            :key="item._id"
            v-model="item.text"
            :min-height="15"
            :rows="1"
            @focus.native="changeCurrentItem(item)"
            @keydown.up.native.prevent="moveItemUp(true, item)"
            @keydown.down.native.prevent="moveItemUp(false, item)"
            @keydown.enter.native.prevent="handleEnter"
            @keydown.delete.native="removeItem"
            @keydown.tab.native.prevent="toggleDoneItem(item)"
          ></textarea-autosize>
        </div>
        <div class="day-item-note-wrapper" v-if="item.note">
          <textarea-autosize
            class="day-item-note"
            :ref="`note-${item.note._id}`"
            v-model="item.note.body"
            :min-height="20"
            @blur.native="updateNoteText"
            @focus.native="changeCurrentItem(item)"
            @keydown.native.tab.prevent="toggleDoneItem(item)"
            @keydown.native.delete="removeNote(item)"
          ></textarea-autosize>
        </div>
      </div>
    </template>
  </li>
</template>

<script>
import uuid from 'uuid/v4'
import { debounce as _debounce } from 'lodash'
import AdaptiveTextarea from './DayItem/AdaptiveTextarea'
import util from '../../util'
import db from '../../db'

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
    sortedByOrderItems: function () {
      return this.items.sort((a, b) => a.order - b.order)
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
      return this.currentItem.text.length || 0
    },
    iscurrentItemTextEmpty: function () {
      return this.currentItemTextLength === 0
    },
    currentItemIndex: function () {
      if (this.currentItem === null || this.currentItem === undefined) {
        return -1
      }
      return this.day.items.findIndex(i => this.currentItem._id === i._id)
    }
  },
  watch: {
    'currentItem.text': function (val) {
      this.updateItemText()
    },
    'currentItem.note.body': function (val) {
      this.updateNoteText()
    }
  },
  methods: {
    focusCurrentItem: function () {
      this.$nextTick(() => {
        const target = `inputs-${this.currentItem._id}`
        this.$refs[target][0].$el.focus()
      })
    },
    changeCurrentItem: function (item) {
      this.currentItem = item
    },
    addNewItemWithEmpty: function () {
      const newItem = this.getNewItemTemplate('', this.itemCount)
      db.post(this.$db, newItem)
        .then(response => {
          this.day.items.push(newItem)
          this.currentItem = newItem
          this.updateItemOrder()
          this.focusCurrentItem()
        })
    },
    /**
     * 아이템이 선택된 경우만 작동함
     */
    addNewItem: function () {
      const caretPosition = util.getCaretPosition()
      const isCaretPositionMiddle = caretPosition !== this.currentItemTextLength

      let tailText = ''
      let remainText = this.currentItem.text

      if (isCaretPositionMiddle) {
        remainText = this.currentItem.text.slice(0, caretPosition)
        tailText = this.currentItem.text.slice(caretPosition, this.currentItemTextLength)
      }
      const item = Object.assign({}, this.currentItem)
      const currentItemIndex = this.currentItemIndex
      const nextItemIndex = currentItemIndex + 1

      db.update(this.$db, item, { text: remainText }).then(_ => {
        this.currentItem.text = remainText
        this.currentItem = null
        const newItem = this.getNewItemTemplate(tailText, nextItemIndex)
        db.post(this.$db, newItem).then(_ => {
          this.day.items.splice(nextItemIndex, 0, newItem)
          this.updateItemOrder()
          this.currentItem = newItem
          this.focusCurrentItem()
        })
      })
    },
    updateItemOrder: function () {
      this.day.items.forEach((item, index) => {
        db.update(this.$db, item, { order: index }).then(_ => {
          item.order = index
        })
      })
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
      this.focusCurrentItem()
    },
    /**
     * 전달받은 아이템의 완료 상태를 토글
     */
    toggleDoneItem: function (item) {
      const nextDoneState = !item.isDone
      db.update(this.$db, item, {
        isDone: nextDoneState
      }).then(_ => {
        item.isDone = nextDoneState
      })
    },
    /**
     * 캐럿 포지션이 0이고 텍스트가 0개일때 아이템을 삭제한다
     */
    removeItem: function () {
      const isEmptyLength = this.iscurrentItemTextEmpty
      const isZeroCaret = util.getCaretPosition() === 0
      if (isEmptyLength && isZeroCaret) {
        const nextIndex = this.findNextItemIndex(this.currentItem)
        db.destroy(this.$db, this.currentItem).then(result => {
          this.day.items.splice(this.currentItemIndex, 1)
          if (nextIndex === -1) {
            this.currentItem = null
          } else {
            this.currentItem = this.items[nextIndex]
            this.focusCurrentItem()
          }
          this.updateItemOrder()
        })
      }
    },
    removeNote: function () {
      const isCaretPositionZeroAndEmptyText = util.getCaretPosition() === 0 && this.currentItem.note.body.length === 0
      if (isCaretPositionZeroAndEmptyText) {
        db.update(this.$db, this.currentItem, { note: undefined }).then(_ => {
          this.$set(this.currentItem, 'note', undefined)
          this.focusCurrentItem()
        })
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
        return -1
      }
      const isMoreThanOne = this.itemCount > 1
      if (isFirstItem && isMoreThanOne) {
        return this.currentItemIndex
      } else if (isLastItem && isMoreThanOne) {
        return this.itemCount - 2
      } else {
        return this.currentItemIndex - 1
      }
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
      console.log('add item note', this.currentItem.note)
      if (this.currentItem.note === undefined) {
        this.$set(this.currentItem, 'note', {
          _id: uuid(),
          body: ''
        })
      }
      const targetId = this.currentItem._id
      this.$db.get(targetId).then(doc => {
        doc.note = this.currentItem.note
        doc.updatedAt = new Date()
        this.$db.put(doc)
      })
      this.$nextTick(_ => {
        const id = this.currentItem.note._id
        const target = `note-${id}`
        const input = this.$refs[target][0]
        input.$el.focus()
      })
    },
    updateNoteText: _debounce(function () {
      const targetId = this.currentItem._id
      this.$db.get(targetId).then(doc => {
        doc.note = this.currentItem.note
        doc.updatedAt = new Date()
        this.$db.put(doc)
      })
    }, 100),

    updateItemText: _debounce(function () {
      if (this.currentItem === null) {
        return
      }
      const targetId = this.currentItem._id
      this.$db.get(targetId).then(doc => {
        doc.text = this.currentItem.text
        doc.updatedAt = new Date()
        this.$db.put(doc)
      })
    }, 100),
    getNewItemTemplate: function (text = '', order = -1) {
      return {
        _id: uuid(),
        text: text,
        isDone: false,
        date: this.day.date,
        order: order,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  }
}
</script>

<style lang="scss">
.day-list-item {
  &.today .day-item-title {
    border-bottom: 1px solid black;
  }

  & .done .day-item-input,
  & .done .day-item-note {
    text-decoration:line-through;
  }

  .day-item-title {
    display: inline-block;
    cursor: pointer;
    margin: 0;
    margin-bottom: 5px;
    font-size: 18px;
    font-weight: normal;
  }

  .day-item-checkbox {
    user-select: none;
    cursor: pointer;
    font-size: 30px;
    color: #4fc08d;
  }

  .dummy-text-input {
    outline: none;
    border: none;
    width: 100%;
  }

  .day-item {
    display: flex;
    align-items: center;
    padding-top: 2px;
    padding-bottom: 2px;
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
    box-sizing: border-box;
  }
}
</style>
