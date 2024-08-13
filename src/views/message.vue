<template>
  <el-container>
    <el-main class="message-main">
      <el-tabs v-model="type" class="message-tab" @tab-change="tabChange">
        <el-tab-pane label="点赞" name="1"></el-tab-pane>
        <el-tab-pane label="评论" name="2"></el-tab-pane>
        <el-tab-pane label="收藏" name="3"></el-tab-pane>
        <el-tab-pane label="关注" name="4"></el-tab-pane>
        <el-tab-pane label="私信" name="5"></el-tab-pane>
        <el-tab-pane label="通知" name="6"></el-tab-pane>
      </el-tabs>
      <div v-infinite-scroll="load" v-loading="loading" class="message-content" infinite-scroll-distance="10" infinite-scroll-immediate="false">
        <div v-for="item in list" :key="item.uid" class="message-item">
          {{ item }}
        </div>
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

let type = ref(route.params.type);
let list = ref([]);

let page = ref(1);

const load = () => {
  page.value++;
  getList();
};

//页面变更回调
const tabChange = (tabName) => {
  router.replace('/message/' + tabName);
  type.value = tabName;
  list.value = [];
  page.value = 1;
  getList();
};

const getList = () => {
  request.get('/message/list', { params: { type: type.value, page: 1 } }).then((result) => {
    list.value = result.data;
    if (result.data.length == 0) {
      page.value--;
    }
  });
};
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
}

.message-item {
}
</style>
