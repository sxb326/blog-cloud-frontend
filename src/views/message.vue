<template>
  <el-container>
    <el-main class="message-main">
      <el-tabs v-model="type" class="message-tab" @tab-change="tabChange">
        <el-tab-pane name="like">
          <template #label>
            <el-badge :value="count[0]" :hidden="count[0] == 0">点赞</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="comment">
          <template #label>
            <el-badge :value="count[1]" :hidden="count[1] == 0">评论</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="collect">
          <template #label>
            <el-badge :value="count[2]" :hidden="count[2] == 0">收藏</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="follow">
          <template #label>
            <el-badge :value="count[3]" :hidden="count[3] == 0">关注</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="chat">
          <template #label>
            <el-badge :value="count[4]" :hidden="count[4] == 0">私信</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="notice">
          <template #label>
            <el-badge :value="count[5]" :hidden="count[5] == 0">通知</el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>
      <router-view :refresh-count="getCount" />
    </el-main>
  </el-container>
</template>

<script setup>
import { watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '@/utils/request.js';
const route = useRoute();
const router = useRouter();

let type = ref(route.name)

//页面变更回调
const tabChange = (tabName) => {
  router.replace(tabName)
};

let count = ref([0, 0, 0, 0, 0, 0])

const getCount = () => {
  request.get('/message/counts').then(result => {
    count.value = result.data
  })
}

watch(
  () => route.fullPath, // 返回要监听的响应式引用  
  () => {
    setTimeout(() => {
      getCount()
    }, 100);
  }, { immediate: true }
);
</script>
<style>
.message-main {
  border-radius: 5px;
  height: calc(100vh - 100px);
  flex: 1;
  padding: 0;
}

.message-tab {
  background-color: #fff;
  border-radius: 5px;
}

.message-content {
  background-color: #fff;
  margin-top: 20px;
  height: calc(100vh - 180px);
  overflow: auto;
}

.message-item {
  padding: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.message-item:hover {
  background-color: #f2f3f5;
}

.authorSpan {
  margin-right: 5px;
}

.authorSpan:hover {
  color: #84beff;
}

.blogTitleSpan {}

.blogTitleSpan:hover {
  color: #84beff;
}

.commentContent {
  background-color: ghostwhite;
  color: gray;
  margin: 5px;
  padding: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sendTimeBeforeSpan {
  color: gray;
}
</style>
