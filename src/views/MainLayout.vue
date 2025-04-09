<template>
  <!-- 带有顶部栏的框架页 -->
  <div class="main-layout">
    <!-- 顶部栏 -->
    <el-header class="header" style="background-color: #fff">
      <el-row class="header-row" justify="space-between" align="middle">
        <!-- logo -->
        <el-col :span="5" class="header-logo">
          <h3>分布式博客系统</h3>
        </el-col>
        <!-- 顶部栏菜单 -->
        <el-col :span="9" class="header-nav">
          <router-link to="/home" class="menuItem">首页</router-link>
        </el-col>
        <!-- 搜索输入框 -->
        <el-col :span="6">
          <el-input v-model="keyword" style="width: 240px" placeholder="想搜索点什么呢">
            <template #append>
              <el-button :icon="Search" @click="doSearch" />
            </template>
          </el-input>
        </el-col>
        <!-- 登录注册/用户头像部分 -->
        <el-col :span="4" class="header-right">
          <el-button v-if="user === null" type="primary" plain @click="loginFormRef?.open()">登录/注册</el-button>
          <div v-else class="centered-container">
            <el-button type="primary" :icon="Edit" class="centered-item creation" @click="openEditor"> 写文章 </el-button>
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
                <div class="userCard">
                  <el-row :gutter="20">
                    <el-col :span="6">
                      <el-avatar :size="45" :src="pictureUrl + user.picId" class="centered-item avatar" />
                    </el-col>
                    <el-col :span="18">
                      <div style="font-size: 15px">{{ user.nickName }}</div>
                      <div style="margin-top: 5px">硬币：32k</div>
                    </el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="24" class="levelLineDiv">
                      <div style="display: flex">
                        <div style="margin-right: auto; font-weight: bold">LEVEL.3</div>
                        <div style="margin-left: auto">809 / 2000</div>
                      </div>
                      <div>
                        <el-progress :percentage="50" :show-text="false"></el-progress>
                      </div>
                    </el-col>
                  </el-row>
                  <el-row style="text-align: center">
                    <el-col :span="12">
                      <el-button text @click="openUser(user.id)">我的主页</el-button>
                    </el-col>
                    <el-col :span="12">
                      <el-button text>我的设置</el-button>
                    </el-col>
                    <el-col :span="12">
                      <el-button text>我的足迹</el-button>
                    </el-col>
                    <el-col :span="12">
                      <el-button text type="danger" @click="doLogout">退出登录</el-button>
                    </el-col>
                  </el-row>
                </div>
              </template>
            </el-dropdown>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <!-- 切换顶部栏菜单时的router-view -->
    <el-container>
      <el-main>
        <router-view class="custom-main-container" />
      </el-main>
    </el-container>
  </div>
  <!-- 登录表单 -->
  <loginForm ref="loginFormRef" @refresh="loginSuccess()"></loginForm>
</template>

<script setup>
import { ElMessage } from 'element-plus';
import { Edit, Search } from '@element-plus/icons-vue';
import { getCurrentInstance, onMounted, reactive, ref, watch } from 'vue';
import { localStorage } from '@/utils/storage';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/modules/auth';
import { storeToRefs } from 'pinia';

const { proxy } = getCurrentInstance();

onMounted(() => {
  getAuthUser();
});

// 获取当前登录用户
async function getAuthUser() {
  const response = await proxy.$api.auth.getAuthUser();
  if (response.data) {
    // 设置当前AuthUser
    useAuthStore().setAuthUser(response.data);
    // 创建WebSocket连接 准备接收消息推送
    createWebSocketConnection();
  } else {
    // 清除当前AuthUser
    useAuthStore().clearAuthUser();
    // 清除本地保存的token
    localStorage.remove('BLOG_TOKEN');
  }
}

const { showLoginForm, authUser: user } = storeToRefs(useAuthStore());
const pictureUrl = ref(import.meta.env.VITE_APP_SERVICE_API + '/picture/');

// 登录表单
const loginFormRef = ref();

// watch 监视 pinia 中 showLoginForm
watch(showLoginForm, () => {
  if (showLoginForm.value === true) {
    loginFormRef.value.open();
  }
});

// 登录成功回调 获取AuthUser
const loginSuccess = () => {
  getAuthUser();
};

//退出登录
const doLogout = () => {
  // 清除pinia中的 AuthUser 数据
  useAuthStore().clearAuthUser();
  // 清除本地保存的token
  localStorage.remove('BLOG_TOKEN');
  ElMessage({ message: '注销成功', type: 'success' });
};

// 搜索关键字
let keyword = ref('');

const route = useRoute();
const router = useRouter();

onMounted(() => {
  //检查检索关键字
  if (route.params.keyword) {
    keyword.value = route.params.keyword;
  }
});

// 进行搜索
function doSearch() {
  const searchKeyword = keyword.value?.trim();

  if (!searchKeyword) {
    ElMessage({ message: '搜索关键字不能为空', type: 'warning' });
    return;
  }

  const timestamp = Date.now();
  const searchPath = `/search/${encodeURIComponent(searchKeyword)}?timestamp=${timestamp}`;

  if (route.path.startsWith('/search')) {
    router.push(searchPath);
  } else {
    const newWindow = window.open('', '_blank');
    const baseUrl = window.location.origin + (import.meta.env.BASE_URL || '/');
    newWindow.location.href = `${baseUrl}#${searchPath}`;
  }
}

// 消息
let messageCount = reactive({
  totalCount: 0,
  likeCount: 0,
  commentCount: 0,
  collectCount: 0,
  followCount: 0,
  chatCount: 0,
  noticeCount: 0,
});

// 全双工 待优化
const createWebSocketConnection = () => {
  let websocket = new WebSocket(import.meta.env.VITE_APP_SERVICE_API + '/message/websocket/' + user.value.id);

  websocket.onopen = function () {};
  websocket.onmessage = function (msg) {
    Object.assign(messageCount, JSON.parse(msg.data));
  };
  websocket.onclose = function () {};
  websocket.onerror = function () {};
};

const openEditor = () => {
  window.open(window.location.origin + '/#/editor');
};

const openMessage = (type) => {
  window.open(window.location.origin + '/#/message/' + type);
};

const openUser = (id) => {
  window.open(window.location.origin + '/#/user/' + id);
};
</script>

<style>
.el-progress-bar__outer {
  background-color: #b6d0ff;
}
</style>

<style scoped>
.main-layout {
  padding-top: 30px;
}

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
  margin: 20px;
  width: 200px;
}

.userCard > div {
  margin-bottom: 10px;
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

.levelLineDiv {
  padding: 0 10px;
  background: #eaf2ff;
  border-radius: 5px;
}

.levelLineDiv > div {
  margin-top: 5px;
  margin-bottom: 5px;
}

.levelLineDiv:first-child {
  margin-bottom: 0;
}
</style>
