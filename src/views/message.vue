<template>
  <el-container>
    <el-main class="message-main">
      <el-tabs v-model="type" class="message-tab" @tab-change="tabChange">
        <el-tab-pane name="1">
          <template #label>
            <el-badge :value="count[0]" :show-zero="false">点赞</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="2">
          <template #label>
            <el-badge :value="count[1]" :show-zero="false">评论</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="3">
          <template #label>
            <el-badge :value="count[2]" :show-zero="false">收藏</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="4">
          <template #label>
            <el-badge :value="count[3]" :show-zero="false">关注</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="5">
          <template #label>
            <el-badge :value="count[4]" :show-zero="false">私信</el-badge>
          </template>
        </el-tab-pane>
        <el-tab-pane name="6">
          <template #label>
            <el-badge :value="count[5]" :show-zero="false">通知</el-badge>
          </template>
        </el-tab-pane>
      </el-tabs>
      <div v-infinite-scroll="load" v-loading="loading" class="message-content" infinite-scroll-distance="10"
        infinite-scroll-immediate="false">
        <div v-if="list.length > 0">
          <div v-for="item in list" :key="item.uid">
            <el-row v-if="item.content === null" class="message-item" :gutter="20">
              <el-col :span="1">
                <el-avatar :size="40" :src="imgUrl + item.sendUserPicUid" class="centered-item avatar" />
              </el-col>
              <el-col :span="23">
                <span class="authorSpan">{{ item.sendUserNickName }}</span>
                <span style="color: gray;">{{ getOperateName(type) }}</span>
                <span v-if="type === '1'">
                  <span v-if="item.commentUid === null">
                    您的文章：<span class="blogTitleSpan" @click="jumpToPreview(item.blogUid)">《{{ item.blogTitle }}》</span>
                  </span>
                  <span v-else>
                    您在文章
                    <span class="blogTitleSpan" @click="jumpToPreview(item.blogUid)">《{{ item.blogTitle }}》</span>
                    中的评论：<div class="commentContent">{{ item.commentContent }}</div>
                  </span>
                </span>
                <span v-if="type === '2'">
                  <span v-if="item.commentLevel === 0">
                    您的文章：<span class="blogTitleSpan" @click="jumpToPreview(item.blogUid)">《{{ item.blogTitle }}》</span>
                    <div class="commentContent">{{ item.commentContent }}</div>
                  </span>
                  <span v-else>
                    您在文章
                    <span class="blogTitleSpan" @click="jumpToPreview(item.blogUid)">《{{ item.blogTitle }}》</span>中的评论：
                    <div class="commentContent">{{ item.commentContent }}</div>
                  </span>
                </span>
                <span v-if="type === '3'">
                  您的文章：<span class="blogTitleSpan" @click="jumpToPreview(item.blogUid)">《{{ item.blogTitle }}》</span>
                </span>
                <span v-if="type === '4' || type === '5'">
                  您
                </span>
              </el-col>
              <el-col :span="1"></el-col>
              <el-col :span="23"><span class="sendTimeBeforeSpan">{{ item.sendTimeBefore }}</span></el-col>
            </el-row>
            <div v-else>
              {{ item.content }}
            </div>
          </div>
        </div>
        <el-empty v-else description="没有消息"></el-empty>
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '@/utils/request.js';

const route = useRoute();
const router = useRouter();
const imgUrl = import.meta.env.VITE_IMG_URL;

let type = ref(route.params.type);
let list = ref([]);

let page = ref(1);

const load = () => {
  page.value++;
  getList();
};

const getOperateName = (type) => {
  switch (type) {
    case '1': return '点赞了';
    case '2': return '评论了';
    case '3': return '收藏了';
    case '4': return '关注了';
    case '5': return '私信了';
  }
}

const jumpToPreview = (blogUid) => {
  window.open(window.location.origin + "/#/preview/" + blogUid);
}

//页面变更回调
const tabChange = (tabName) => {
  router.replace('/message/' + tabName);
  type.value = tabName;
  list.value = [];
  page.value = 1;
  getList();
};

const getList = () => {
  request.get('/message/list', { params: { type: type.value, page: page.value } }).then((result) => {
    list.value.push(...result.data);
    if (result.data.length == 0) {
      page.value--;
    }
    getCount();
  });
};

let count = ref([0, 0, 0, 0, 0, 0])

const getCount = () => {
  request.get('/message/counts').then(result => {
    count.value = result.data
  })
}

onMounted(() => {
  getList();
});
</script>
<style scoped>
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
