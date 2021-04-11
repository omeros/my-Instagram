import Vue from 'vue'
import Vuex from 'vuex'

import { userStore } from './user.store.js'
import { socketStore } from './socket.store.js'
import { reviewStore } from './review.store.js'
import { storyService } from "../services/story.service.js";
import { utilService } from "../services/util.service.js";

Vue.use(Vuex)

export const store = new Vuex.Store({
  strict: true,
  state: {
    stories: [],
    filterBy: null,
    lastPath: null,
    editChanges: null,
    isCommentLikedBefor : false
  },
  getters: {
    //  isCommentLiked  : (state) => (details) =>
    // {
    //   var storyId= details.storyId
    //   var commentIdx = details.commentIdx
    //    var isLikedBefor = [false];
    //    var theUser =  userStore.state.loggedinUser
    //    isLikedBefor = story.comments[commentIdx].likedBy.filter(user => {
    //    if(user._id===userDetails._id){
    //     const isItTheUser = (element) => element._id===user._id;
    //       var idx = storyCommentToLike.comments[commentIdx].likedBy.findIndex(isItTheUser)
    //       console.log('the id to delete',idx)
    //       storyCommentToLike.comments[commentIdx].likedBy.splice(idx,1)
    //         console.log('yes baby')
    //       return true
    //      }
    //   })
    //   console.log('isLikedBefor',isLikedBefor)
    //    return isLikedBefor
    // },
    isCommentLikedBefor(state){
       return state.isCommentLikedBefor
    },
    getStories(state) {
      return state.stories
    },
    getEmptyStory(state){
       var emptyStory = storyService.getEmptystory()
       var theUser =  userStore.state.loggedinUser
       emptyStory.by._id = theUser._id
       emptyStory.by.fullname = theUser.fullname
       emptyStory.by.imgUrl = theUser.imgUrl
       return  emptyStory
    },
    storiesToShow(state) {
      if (!state.filterBy) return state.stories
      const searchStr = state.filterBy.toLowerCase()
      const storiesToShow = state.stories.filter(story => {
        return story.by.fullname.toLowerCase().includes(searchStr)
      })
      return storiesToShow
    },

    getStoryByUserId: (state) => (id) => {
      var storyToFind = []
      state.stories.find(story => {
        if (story.by._id === id) {
          storyToFind.push(story);
        }
      })
      return storyToFind
    },
    getStoryById: (state) => (id) => {
      var storyToEdit = null
      state.stories.find(story => {
        if (story._id === id) {
          storyToEdit = story;
        }

      })
      return storyToEdit
    },
  },
  mutations: {
    filterByChanged(state, payload) {
      console.log('filterByChanged is running', payload.strFilter.name)
      state.filterBy = payload.strFilter.name
    },
    setStories(state, { stories }) {
      state.stories = stories;
    },

    setStory(state, payload) {
      console.log('on store on mutex befor update state.stories',payload)

      let t = JSON.parse(JSON.stringify(payload.updatedStory))
      console.log('on store on mutex middle update state.stories',t)
      state.stories.push(t);
      // let e = [...state.stories]
      // console.log('on store on mutex after update state.stories',e)
    },



    //   var storyRemoveLike = state.stories.filter(story => {
    //     return (story._id===storyId)
    //   })
    updateStories(state,payload) {
      const idx = state.stories.findIndex(p => p._id === payload.updatedStory._id)
      state.stories.splice(idx, 1, payload.updatedStory);
  },
  commentLikedBefor(state,payload) {
    this.state.isCommentLikedBefor = true
  },
  commentNotLikedBefor(state,payload) {
    this.state.isCommentLikedBefor = true
  },

  },
  actions: {
      removeStory(context, payload){
        console.log('remove in store',payload.storyToRemoveId)
        storyService.remove(storyToRemoveId)
        .then(updatedStory => {
          context.commit({ type: 'updateStories', updatedStory });
        })
      },
     addNewStory(context, payload){
      console.log('payload in store',payload.newStory)
      storyService.save(payload.newStory)
      .then(updatedStory => {
        context.commit({ type: 'setStory', updatedStory });
      })
     .catch(err => {
      console.log('Store: Cannot update like to comment in  stories', err);
      throw new Error('Cannot update like to comment in  stories');
    })



      
     },

    addLikeToComment(context, payload){
      var storyId = payload.theDetails.storyId
      var commentIdx =payload.theDetails.commentIdx
      var theUser = userStore.state.loggedinUser
      var userDetails = {
        _id: theUser._id,
        fullname: theUser.fullname,
        imgUrl: theUser.imgUrl
      }
      console.log('payload.details.',payload.theDetails)
        storyService.getById(storyId)
        .then(storyCommentToLike => {
         // console.log('storyCommentToLike',storyCommentToLike)

       var isLikedBefor = [false];
       isLikedBefor = storyCommentToLike.comments[commentIdx].likedBy.filter(user => {
       if(user._id===userDetails._id){
        const isItTheUser = (element) => element._id===user._id;
          var idx = storyCommentToLike.comments[commentIdx].likedBy.findIndex(isItTheUser)
          console.log('the id of the comment array to splice ',idx)
          storyCommentToLike.comments[commentIdx].likedBy.splice(idx,1)
          // context.commit({ type: 'commentLikedBefor' });
          // this.state.isCommentLikedBefor = true
          return true
         }
      })

      console.log(' after filter the comment equal to id of the user',isLikedBefor)
       if(isLikedBefor.length===0){
        console.log(' a new liker')
        // context.commit({ type: 'commentNotLikedBefor' });
        // this.state.isCommentLikedBefor = false
        storyCommentToLike.comments[commentIdx].likedBy.push(userDetails)
      }
       
       

          storyService.save(storyCommentToLike)
          .then(updatedStory => {
            context.commit({ type: 'updateStories', updatedStory });
          })
        })
        .catch(err => {
          console.log('Store: Cannot update like to comment in  stories', err);
          throw new Error('Cannot update like to comment in  stories');
        })

    },
    removeLikeFromStory(context, payload) {
      var storyId = payload.storyId
      var theloggedInUser = userStore.state.loggedinUser
        storyService.getById(storyId)
        .then(storyRemoveLike => {
          console.log('Store: storyRemoveLike',storyRemoveLike)
          const idx = storyRemoveLike.likedBy.findIndex(user => user._id === theloggedInUser._id)
          storyRemoveLike.likedBy.splice(idx, 1);
          
         // storyRemoveLike.likedBy.pop();
          storyService.save(storyRemoveLike)
          .then(updatedStory => {
            context.commit({ type: 'updateStories', updatedStory });
          })
        })
        .catch(err => {
          console.log('Store: Cannot remove liket in  stories', err);
          throw new Error('Cannot remove like in  stories');
        })
      // var storyRemoveLike = state.stories.filter(story => {
      //   return (story._id===storyId)
      // })
      // storyRemoveLike[0].likedBy.pop();
    },
    setLikeToStory(context, payload) {
      var storyId = payload.storyId
      var theUser = userStore.state.loggedinUser

       storyService.getById(storyId)
        .then(storyToLike => {
          var userDetails = {
            _id: theUser._id,
            fullname: theUser.fullname,
            imgUrl: theUser.imgUrl
          }
          storyToLike.likedBy.push(userDetails)
          storyService.save(storyToLike)
          .then(updatedStory => {
            console.log('Store:updatedStory',updatedStory)
            context.commit({ type: 'updateStories', updatedStory });
          })
        })
        .catch(err => {
          console.log('Store: Cannot update like in  stories', err);
          throw new Error('Cannot update like in  stories');
        })
    },
    addCommentToStory(context, payload) {
      console.log('add comment in store :', payload)
      var storyId = payload.comment.storyId
      var commentTxt = payload.comment.txt
      var theUser = userStore.state.loggedinUser
       storyService.getById(storyId)
        .then(storyToComment => {
            var commentToAdd = {
            id: utilService.makeId(),
            by: {
              _id: theUser._id,
              fullname: theUser.fullname,
              imgUrl: theUser.imgUrl
            },
            txt: commentTxt
          }
          storyToComment.comments.push(commentToAdd)
          storyService.save(storyToComment)
            .then(updatedStory => {
              context.commit({ type: 'updateStories', updatedStory });
            })
        })
          .catch(err => {
          console.log('Store: Cannot update comment in  stories', err);
          throw new Error('Cannot update comment in  stories');
        })
    },
    loadStories({ commit, state }) {
      storyService.query(state.filter || undefined)
        .then(stories => {
          console.log('in store - load stories from local storage', stories)
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
