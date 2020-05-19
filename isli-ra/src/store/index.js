import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  blogTitle: '迩伶贰blog',
  views: 10,
  blogNumber: 100,
  total: 0,
  count: 0,
  todos: [
    {id: 1, done: true, text: '我是码农'},
    {id: 2, done: false, text: '我是码农202号'},
    {id: 3, done: true, text: '我是码农202号'}
  ]
}

const mutations = {
  addViews (state) {
    state.views++
  },
  blogAdd (state) {
    state.blogNumber++
  },
  clickTotal (state) {
    state.total++
  }
}

const actions = {
  addViews ({commit}) {
    commit('addViews')
  },
  blogAdd ({commit}) {
    commit('blogAdd')
  },
  clickTotal ({commit}) {
    commit('clickTotal')
  }
}

const getters = {
  getToDo (state) {
    return state.todos.filter(item => item.done === true)
  }
}

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters
})

export default store
