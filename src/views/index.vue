<template>
  <div id="app">
    <el-header class="header" style="background-color: #fff">
      <el-row class="header-row" justify="space-between" align="middle">
        <el-col :span="5" class="header-logo">
          <h3>分布式博客系统</h3>
        </el-col>
        <el-col :span="9" class="header-nav">
          <router-link to="/home" class="menuItem">首页</router-link>
        </el-col>
        <el-col :span="6">
          <el-input v-model="keyWord" style="width: 240px" placeholder="想搜索点什么呢">
            <template #append>
              <el-button :icon="Search" @click="doSearch" />
            </template>
          </el-input>
        </el-col>
        <el-col :span="4" class="header-right">
          <el-button v-if="isUserEmpty(user)" type="primary" plain @click="openLoginForm">登录/注册 </el-button>
          <div v-else class="centered-container">
            <el-button type="primary" :icon="Edit" class="centered-item creation" @click="openEditor">写文章</el-button>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link">
                <el-icon size="28" class="centered-item" style="color: gray">
                  <el-badge :value="messageCount.totalCount" :hidden="messageCount.totalCount == 0">
                    <BellFilled class="message-icon" />
                  </el-badge>
                </el-icon>
              </span>
              <template #dropdown>
                <div class="message-card">
                  <div class="message-card-item" @click="openMessage('like')">
                    点赞
                    <el-tag v-if="messageCount.likeCount > 0" type="danger" effect="dark" round class="message-card-badge" size="small">{{ messageCount.likeCount }} </el-tag>
                  </div>
                  <div class="message-card-item" @click="openMessage('comment')">
                    评论
                    <el-tag v-if="messageCount.commentCount > 0" type="danger" effect="dark" round class="message-card-badge" size="small">{{ messageCount.commentCount }} </el-tag>
                  </div>
                  <div class="message-card-item" @click="openMessage('collect')">
                    收藏
                    <el-tag v-if="messageCount.collectCount > 0" type="danger" effect="dark" round class="message-card-badge" size="small">{{ messageCount.collectCount }} </el-tag>
                  </div>
                  <div class="message-card-item" @click="openMessage('follow')">
                    关注
                    <el-tag v-if="messageCount.followCount > 0" type="danger" effect="dark" round class="message-card-badge" size="small">{{ messageCount.followCount }} </el-tag>
                  </div>
                  <div class="message-card-item" @click="openMessage('chat')">
                    私信
                    <el-tag v-if="messageCount.chatCount > 0" type="danger" effect="dark" round class="message-card-badge" size="small">{{ messageCount.chatCount }} </el-tag>
                  </div>
                  <div class="message-card-item" @click="openMessage('notice')">
                    通知
                    <el-tag v-if="messageCount.noticeCount > 0" type="danger" effect="dark" round class="message-card-badge" size="small">{{ messageCount.noticeCount }} </el-tag>
                  </div>
                </div>
              </template>
            </el-dropdown>
            <el-dropdown trigger="click">
              <span class="el-dropdown-link">
                <el-avatar :size="40" :src="pictureUrl + user.picId" class="centered-item avatar" />
              </span>
              <template #dropdown>
                <el-card class="userCard">
                  <el-row>
                    <el-col :span="6">
                      <el-avatar :size="40" :src="pictureUrl + user.picId" class="centered-item avatar" />
                    </el-col>
                    <el-col :span="18" style="display: flex; justify-content: center; align-items: center; font-weight: bold">
                      {{ user.nickName }}
                    </el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="12">
                      <el-button text @click="openUser(user.id)">个人主页</el-button>
                    </el-col>
                    <el-col :span="12">
                      <el-button text @click="logout">退出登录</el-button>
                    </el-col>
                  </el-row>
                </el-card>
              </template>
            </el-dropdown>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-main>
        <router-view class="custom-main-container" />
      </el-main>
    </el-container>
  </div>
  <loginForm ref="loginFormRef" @refresh-page="refreshPage()"></loginForm>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { Edit, Search } from '@element-plus/icons-vue';
import { computed, getCurrentInstance, onMounted, reactive, ref, watch } from 'vue';
import { localStorage } from '@/utils/storage';
import request from '@/utils/request.js';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth.js';

const { proxy } = getCurrentInstance();

onMounted(getAuthUser);

const pictureUrl = ref(import.meta.env.VITE_APP_SERVICE_API + '/picture/');

//获取登录用户头像id
let user = reactive({});

//获取当前登录用户
async function getAuthUser() {
  const response = await proxy.$api.auth.getAuthUser();
  if (response.data) {
    Object.assign(user, response.data);
    localStorage.set('BLOG_USER', response.data);
    createWebSocketConnection();
  } else {
    for (const key in user) {
      if (Object.prototype.hasOwnProperty.call(user, key)) {
        delete user[key];
      }
    }
  }
}

//判断用户对象是否为空
function isUserEmpty(obj) {
  return Object.keys(obj).length === 0;
}

//登录窗口
const showLoginForm = computed(() => useAuthStore().loginFormStatus);
watch(showLoginForm, () => {
  openLoginForm();
});
const loginFormRef = ref();

const openLoginForm = () => {
  loginFormRef.value.open();
};

// 搜索
let keyWord = ref('');

const route = useRoute();
const router = useRouter();

onMounted(() => {
  //检查检索关键字
  if (route.params.keyword) {
    keyWord.value = route.params.keyword;
  }
});

let messageCount = reactive({
  totalCount: 0,
  likeCount: 0,
  commentCount: 0,
  collectCount: 0,
  followCount: 0,
  chatCount: 0,
  noticeCount: 0,
});

const createWebSocketConnection = () => {
  let websocket = new WebSocket(import.meta.env.VITE_APP_SERVICE_API + '/message/websocket/' + user.id);

  websocket.onopen = function () {};
  websocket.onmessage = function (msg) {
    Object.assign(messageCount, JSON.parse(msg.data));
  };
  websocket.onclose = function () {};
  websocket.onerror = function () {};
};

function doSearch() {
  if (keyWord.value) {
    let path = route.path;
    let time = new Date().getTime();
    if (path.startsWith('/search')) {
      router.push('/search/' + keyWord.value + '?timestamp=' + time);
    } else {
      window.open(window.location.origin + '/#/search/' + keyWord.value);
    }
  } else {
    ElMessage({
      message: '检索关键字不能为空',
      type: 'warning',
    });
  }
}

//注销
const logout = () => {
  localStorage.remove('BLOG_TOKEN');
  ElMessage({
    message: '注销成功',
    type: 'success',
  });
  refreshPage();
};

const openEditor = () => {
  request.get('/web/blog/id').then((result) => {
    window.open(window.location.origin + '/#/editor/' + result.data);
  });
};

const refreshPage = () => {
  window.location.reload();
};

const openMessage = (type) => {
  window.open(window.location.origin + '/#/message/' + type);
};

const openUser = (id) => {
  window.open(window.location.origin + '/#/user/' + id);
};
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  height: 60px;
  line-height: 60px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  box-sizing: border-box;
}

.header-row {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.header-logo img {
  height: 20px;
}

.header-nav {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.search-input {
  width: 150px;
  margin-right: 10px;
}

#app {
  padding-top: 30px;
}

.menuItem {
  margin: 0 10px;
  cursor: pointer;
}

.menuItem:hover {
  border-bottom: 2px solid #007bff;
}

.router-link-active {
  text-decoration: none;
  color: #646cff;
}

a {
  text-decoration: none;
  color: black;
}

.centered-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.centered-item {
  margin-right: 30px;
  cursor: pointer;
}

.centered-item :last-of-type {
  margin-right: 0;
}

.creation {
  margin-right: 25px;
}

.creationCard {
  display: flex;
}

.userCard {
  width: 200px;
}

.message-icon:hover {
  color: rgb(95, 95, 95);
}

.message-card {
  width: 120px;
  padding: 5px 8px;
}

.message-card-item {
  font-size: 16px;
  display: flex;
  /* justify-content: center; */
  align-items: center;
  min-height: 40px;
  cursor: pointer;
  margin: 5px 0;
  padding: 0 0 0 10px;
}

.message-card-item:hover {
  background: #f2f3f5;
  color: #409eff !important;
}

.message-card-badge {
  margin: 0 10px 0 auto;
}
</style>