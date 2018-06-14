import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
const state = {
    list: [],
}
const PUSH_LIST = 'PUSH_LIST';
const CLEAR_LIST = 'CLEAR_LIST';

const mutations = {
    [PUSH_LIST](state, info) {
        state.list.push(info);
    },
    [CLEAR_LIST](state, info) {
        state.list = [];
    },
}
const getters = {
}

const actions = {
    push: ({ commit }, info) => {
        commit(PUSH_LIST, info);
    },
    clear: ({ commit }) => {
        commit(CLEAR_LIST);
    },
}

export default new Vuex.Store({
    state,
    mutations,
    getters,
    actions,
    strict: process.env.NODE_ENV !== 'production'
})
