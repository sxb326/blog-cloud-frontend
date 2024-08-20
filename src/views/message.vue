<template>
  <el-container>
    <el-main class="message-main">
      <el-tabs v-model="type" class="message-tab" @tab-change="tabChange">
        <el-tab-pane name="like">
          <template #label>
            <el-badge :value="count[0]" :show-zero="false">点赞</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="comment">
          <template #label>
            <el-badge :value="count[1]" :show-zero="false">评论</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="collect">
          <template #label>
            <el-badge :value="count[2]" :show-zero="false">收藏</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="follow">
          <template #label>
            <el-badge :value="count[3]" :show-zero="false">关注</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="chat">
          <template #label>
            <el-badge :value="count[4]" :show-zero="false">私信</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="notice">
          <template #label>
            <el-badge :value="count[5]" :show-zero="false">通知</el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>
      <router-view :refresh-count="getCount" />
    </el-main>
  </el-container>
</template>

<script setup>
import { onMounted, ref } from 'vue';
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

onMounted(() => {
  getCount();
})
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
