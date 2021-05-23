<template>
  <div>
    <h1>Vue-TypeScript-TODOリスト</h1>
    <label v-for="[state, text] in Array.from(labels)" :key="state">
      <input type="radio" v-model="current" :value="state">
      {{ text }}
    </label>
    <br>

    <!-- 件数の表示 -->
    {{ filteredTodos.length }} 件を表示中

    <!-- 全ての要素を削除する -->
    <button @click="removeAll()" class="button_remove">
      すべて削除
    </button>
    <!-- 選択したものを削除する -->
    <button @click="removeChecked()" class="button_remove">
      選択したものを削除
    </button>

    <!-- メモアプリのテーブル（本体） -->
    <div id="app">
      <table>
        <thead>
          <!-- 見出しの行 -->
          <tr>
            <th class="id" @click="sortList('id')">ID</th>
            <th class="comment">タスク内容</th>
            <th class="deadline" @click="sortList('deadline')">期限</th>
            <th class="priority" @click="sortList('priority')">優先度</th>
            <th class="state">状態</th>
            <th class="button">-</th>
          </tr>
        </thead>

        <!-- テーブル本体 -->
        <tbody>
          <!-- v-forを使って1行ずつレンダリング -->
          <tr v-for="(todo, index) in filteredTodos"
            :key="todo.id" 
            draggable 
            @dragstart="dragList($event, index)" 
            @drop="dropList($event, index)" 
            @dragover.prevent 
            @dragenter.prevent>

            <!-- 複数行選択して削除するときに使うチェックボックス -->
            <th><input type="checkbox" v-model="todo.checked">{{ todo.id }}</th>
            <!-- 名前: string -->
            <td :style="turnRed(todo)">{{ todo.name }}</td>
            <!-- 期限: Date -->
            <td :style="turnRed(todo)">{{ todo.deadline }}</td>
            <!-- 優先度: Priority -->
            <td class="priority">
              <button @click="togglePriority(todo)">
                {{ priority_labels.get(todo.priority) }}
              </button>
            </td>
            <!-- 状態: State -->
            <td class="state">
              <button @click="toggleState(todo)">
                {{ labels.get(todo.state) }}
              </button>
            </td>
            <!-- 削除ボタン -->
            <td class="button">
              <button @click.shift="removeTodo(todo)">
                削除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    

    <p>
      ※削除ボタンはシフトキーを押しながらクリックして下さい
    </p>

    <!-- Todoの追加 -->
    <h2>新しい作業の追加</h2>
    <form class="add-item" @submit.prevent="addTodo">
      タスク内容 <input type="text" ref="name">
      締め切り <input type="datetime-local" ref="deadline">
      <button type="submit">追加</button>
    </form>
  </div>
</template>

<script lang="ts">
//各種必要ファイルからクラスや型をimportする
import { Component, Vue, Watch } from 'vue-property-decorator';
import TodoStorage from '@/todoStorage';
import { State, Priority, TodoItem } from '@/todoItem'

//現在の状態を保存する
const todoStorage = new TodoStorage()

@Component
export default class App extends Vue {
  //todoItem.tsから引っ張ってきた型を元に、配列を生成
  private todos: TodoItem[] = []

  //Stateとstringを紐づけておく
  private labels = new Map<State, string>([
    [State.All, '全て'],
    [State.Working, '作業中'],
    [State.Done, '完了']
  ])

  //Priorityとstringを紐づけておく
  private priority_labels = new Map<Priority, string>([
    [Priority.low, '低'],
    [Priority.mid, '中'],
    [Priority.high, '高']
  ])

  //初期値
  private current: State = State.All
  private current_priority: Priority = Priority.mid

  //状態によって表示するリストを変更する
  private get filteredTodos() {
    return this.todos.filter(t =>
      this.current === State.All ? true : this.current === t.state)
  }

  //実はよくわかってない
  private created() {
    this.todos = todoStorage.fetchAll()
  }

  //メモを追加する関数
  private addTodo() {
    const name = this.$refs.name as HTMLInputElement
    const deadline = this.$refs.deadline as HTMLInputElement
    //Tを消す処理
    const deadline_value = deadline.value.replace('T', ' ')
    //比較用date
    const deadline_date = String(new Date(deadline_value));
    let data = new Date();
    let now = data.getFullYear()
    + '-' + ('0' + (data.getMonth() + 1)).slice(-2)
    + '-' + ('0' + data.getDate()).slice(-2)
    + ' ' + ('0' + data.getHours()).slice(-2)
    + ':' + ('0' + data.getMinutes()).slice(-2)
    //console.log(deadline_date)
    console.log(deadline_value)
    console.log(now)
    //console.log(typeof(deadline_date))
    //console.log(typeof(deadline_value))
    //console.log(typeof(now))

    let isexpired = false
    if(deadline_value < now) {
      isexpired = true
    }
    console.log(isexpired)
    //console.log(deadline_date);

    this.todos.push({
      id: todoStorage.nextId,
      name: name.value,
      state: State.Working,
      deadline: deadline_value,
      priority: Priority.mid,
      checked: false,
      isExpired: isexpired
    })
    name.value = ''
  }

  //ソートするやつ
  private sortList(name: string) {
    this.todos.sort((a, b) => {
      if(a[name] < b[name]) return -1;
      if(a[name] > b[name]) return 1;
      return 0;
    })
    return this.todos;
  }

  //1つの行を消す操作
  private removeTodo(todo: TodoItem) {
    const index = this.todos.indexOf(todo)
    this.todos.splice(index, 1)
  }

  //選択された複数の行を消す操作
  private removeChecked() {
    this.todos = this.todos.filter(t => !t.checked)
  }

  //全て消す
  private removeAll(){
    this.todos.splice(0);
  }

  //状態を変化させる
  private toggleState(todo: TodoItem) {
    todo.state = todo.state === State.Working ? State.Done : State.Working
  }

  //優先度を変化させる
  private togglePriority(todo: TodoItem) {
    //todo.priority = todo.priority === Priority.mid ? Priority.low : Priority.mid
    switch(todo.priority){
      case Priority.low:
        todo.priority = Priority.mid
        break
      case Priority.mid:
        todo.priority = Priority.high
        break
      case Priority.high:
        todo.priority = Priority.low
        break
    }
  }

  //期限切れの
  private turnRed(todo: TodoItem){
    if(todo.isExpired){
      return {color: 'red', background: 'pink'}
    } else {
      return {color: 'black'}
    }
  }

  //draggableを実装
  //https://reffect.co.jp/vue/vue-js-table-drag-and-drop
  private dragList(event: any, dragIndex: number){
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
    event.dataTransfer.setData('drag-index', dragIndex)
  }

  private dropList(event: any, dropIndex: number) {
    const dragIndex = event.dataTransfer.getData('drag-index')
    const deleteList = this.todos.splice(dragIndex, 1)
    this.todos.splice(dropIndex, 0, deleteList[0])
  }

  @Watch('todos', { deep: true })
  private onTodoChanged(todos: TodoItem[]) {
    todoStorage.save(todos)
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

#app {
  max-width: 100%;
  margin: 0 auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  border-bottom: 2px solid #0099e4; /*#d31c4a */
  color: #0099e4;
}

th,
th {
  padding: 0 8px;
  line-height: 40px;
}

thead th.id {
  width: 50px;
}

thead th.state {
  width: 100px;
}

thead th.button {
  width: 60px;
}

tbody td.button, tbody td.state {
  text-align: center;
}

tbody tr td,
tbody tr th {
  border-bottom: 1px solid #ccc;
  transition: All 0.4s;
  text-align: center;
}

tbody tr.Done td,
tbody tr.Done th {
  background: #f8f8f8;
  color: #bbb;
}

tbody tr:hover td,
tbody tr:hover th {
  background: #f4fbff;
  cursor: grab;
}

tbody tr:hover td:active {
  cursor: grabbing;
}

button {
  border: none;
  border-radius: 20px;
  line-height: 24px;
  padding: 0 8px;
  background: #0099e4;
  color: #fff;
  cursor: pointer;
}

button:hover {
  opacity: 0.75;
}

.button_remove {
  float: right;
  margin-right: 10px;
}
</style>
