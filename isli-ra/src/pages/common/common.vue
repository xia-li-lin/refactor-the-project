<template>
    <div>
      <h1>vuex状态管理数据</h1>
      <h5>博客标题</h5>
      <i>{{$store.state.blogTitle}}</i>
      <ul>
          <li v-for="todo in todoList" :key="todo.id">
              <span>{{todo.text}}</span>
              <span>{{todo.done}}</span>
          </li>
      </ul>
      <h5>初始化访问量</h5>
      <p>{{viewsCount}}/{{$store.state.views}}</p>
      <button @click="addTotal">点击增加total {{$store.state.total}}</button>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
export default {
  name: 'common',
  data () {
    return {}
  },
  computed: {
    ...mapState({
      viewsCount: 'views'
    }),
    ...mapGetters({
      todoList: 'getToDo'
    })
  },
  methods: {
    ...mapMutations({
      addTotal: 'clickTotal'
    })
  }
}
</script>

<style lang="scss" scoped>

</style>
