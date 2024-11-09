<template>
  <el-container>
    <el-aside width="100px" class="left"></el-aside>
    <el-main class="user-main">
      <div v-loading="loading">
        <div shadow="never" class="user-info">
          <div class="author-div">
            <div class="author-info">
              <el-avatar :size="45" :src="imgUrl + author.picId" class="centered-item avatar" />
              <div class="author-nick-name">{{ author.nickName }}</div>
            </div>
            <div v-if="authUser === null || author.id !== authUser.id" class="author-btn">
              <el-button v-if="author.isFollow === true" size="large" plain type="primary" @click="follow">已关注</el-button>
              <el-button v-else size="large" type="primary" @click="follow">关注</el-button>
              <el-button size="large" :icon="ChatLineSquare" type="primary" plain @click="chat">私信</el-button>
            </div>
          </div>
        </div>
        <div shadow="never" class="user-detail">
          <el-tabs v-model="type" @tab-change="tabChange">
            <el-tab-pane label="文章" name="article"></el-tab-pane>
            <!-- <el-tab-pane label="专栏" name="column"></el-tab-pane> -->
          </el-tabs>
          <router-view />
        </div>
      </div>
    </el-main>
    <div>
      <el-card shadow="never" class="right">
        <template #header> 个人成就 </template>
        <div class="achievement-div">
          <el-icon :size="25">
            <List />
          </el-icon>
          <div class="achievement-text">文章数</div>
          <div class="achievement-value">{{ author.articleCount }}</div>
        </div>
        <div class="achievement-div">
          <el-icon :size="25">
            <View />
          </el-icon>
          <div class="achievement-text">阅读数</div>
          <div class="achievement-value">{{ author.clickCount }}</div>
        </div>
        <div class="achievement-div">
          <el-icon :size="25">
            <Pointer />
          </el-icon>
          <div class="achievement-text">点赞数</div>
          <div class="achievement-value">{{ author.likeCount }}</div>
        </div>
      </el-card>
      <el-card shadow="never" class="right-follow">
        <template #header> 粉丝&关注 </template>
        <div style="width: 100%; display: flex">
          <el-statistic style="flex: 5; text-align: center" title="粉丝数" :value="author.followerCount" />
          <el-statistic style="flex: 5; text-align: center" title="关注数" :value="author.followingCount" />
        </div>
      </el-card>
    </div>
  </el-container>
</template>
<script setup>
import {computed, onMounted, reactive, ref} from 'vue';
import request from '@/utils/request.js';
import { useRoute, useRouter } from 'vue-router';
import { ChatLineSquare } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/store/modules/auth.js';

const route = useRoute();
const router = useRouter();

const imgUrl = import.meta.env.VITE_IMG_URL;
const userId = route.params.id;
const type = route.name;

let loading = ref(false);
let author = reactive({});
let authUser = computed(() => useAuthStore().authUser);

const getUserInfo = () => {
  loading.value = true;
  request.get('/user/getUserInfo', { params: { id: userId } }).then((result) => {
    Object.assign(author, result.data);
  });
  loading.value = false;
};

const tabChange = (tabName) => {
  router.replace(tabName);
};

const chat = () => {
  request.post('/message/conversation/save', { receiveUserId: userId }).then((result) => {
    window.open(window.location.origin + '/#/message/chat?id=' + result.data);
  });
};

const follow = () => {
  request.post('/user/follow/save', { targetUserId: userId, isFollow: !author.isFollow }).then((result) => {
    ElMessage({
      message: result.message,
      type: 'success',
    });
    author.isFollow = !author.isFollow;
  });
};
onMounted(() => {
  getUserInfo();
});
</script>
<style scoped>
.el-container {
  display: flex;
  align-items: stretch;
}

.user-main {
  border-radius: 5px;
  height: calc(100vh - 100px);
  flex: 1;
  padding: 0;
}

.left {
  margin-right: 20px;
}

.right {
  border-radius: 5px;
  margin-left: 20px;
  margin-bottom: 20px;
  background-color: #fff;
  height: 200px;
  width: 300px;
}

.right-follow {
  border-radius: 5px;
  margin-left: 20px;
  margin-bottom: 20px;
  background-color: #fff;
  height: 150px;
  width: 300px;
}

.user-info {
  background-color: #fff;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  padding: 20px;
  border-radius: 5px;
}

.user-detail {
  height: calc(100vh - 30vh);
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 5px;
}

.author-div {
  width: 100%;
  background-color: #fff;
  border-radius: 5px;
  height: calc(100vh - 90vh);
  display: flex;
  align-items: center;
}

.author-info {
  align-items: center;
  display: flex;
  margin-left: 30px;
}

.author-nick-name {
  margin-left: 10px;
}

.author-btn {
  display: flex;
  margin-left: auto;
}

.author-btn > * {
  width: 90px;
}

.achievement-div {
  display: flex;
  align-items: center;
  margin: 10px;
}

.achievement-div:first-child {
  margin: 0 10px;
}

.achievement-div:last-child {
  margin: 0 10px;
}

.achievement-text {
  margin-left: 10px;
}

.achievement-value {
  margin-left: 10px;
}
</style>