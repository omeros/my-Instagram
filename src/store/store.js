import Vue from 'vue'
import Vuex from 'vuex'

import { userStore } from './user.store.js'
import { socketStore } from './socket.store.js'
import { reviewStore } from './review.store.js'
import { storyService } from "../services/story.service.js";

Vue.use(Vuex)

export const store = new Vuex.Store({
  strict: true,
  state: {
    stories: [],
    filterBy :null,
    lastPath: null,
    editChanges: null,
  },
  getters: {
    getStories(state) {
      return state.stories
    },
    storiesToShow(state){
  
    //    console.log('getStoriesToShow',state)
        if (!state.filterBy) return state.stories
        const searchStr = state.filterBy.toLowerCase()
        const storiesToShow = state.stories.filter(story => {
            return story.by.fullname.toLowerCase().includes(searchStr)
        })

        return  storiesToShow



    },

    getStoryByUserId: (state) => (id) => {
      var  storyToFind=[]
      state.stories.find(story => {
          if (story.by._id === id){
              storyToFind.push(story);
          }

      }) 
      return storyToFind
    },
    getStoryById: (state) => (id) => {
      var  storyToEdit=null
      state.stories.find(story => {
          if (story._id === id){
              storyToEdit = story;
          }

      }) 
      return storyToEdit
    },
  //   getToysToShow(state) {
  //     console.log('gettoysToShow',state)
  //     if (!state.filterBy) return state.toys
  //     const searchStr = state.filterBy.toLowerCase()
  //     const toysToShow = state.toys.filter(toy => {
  //         return toy.name.toLowerCase().includes(searchStr)
  //     })
  //     return toysToShow
  // },
  },
  mutations: {
    filterByChanged(state,payload){
      console.log('filterByChanged is running',payload.strFilter.name)
      state.filterBy = payload.strFilter.name
      
  },
    setStories(state, { stories }) {
      state.stories = stories;
    },
  },
  actions: {
    
    loadStories({ commit, state }) {
      storyService.query(state.filter || undefined)
      .then(stories => {
      //  console.log('in store - load stories from local storage',stories)
        commit({ type: 'setStories', stories });
      })
      .catch(err => {
        console.log('Store: Cannot load stories', err);
        throw new Error('Cannot load stories');
      })
    },
  },
  modules: {
    userStore,
    socketStore,
    reviewStore
  },
})
