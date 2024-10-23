<template>
  <div class="message-content">
    <el-row class="container">
      <el-col :span="6" style="border-right: 1px solid gainsboro">
        <div class="search-div">
          <el-input v-model="keyword" style="width: 280px" placeholder="搜索联系人">
            <template #append>
              <el-button :icon="Search" @click="doSearch" />
            </template>
          </el-input>
        </div>
        <div v-loading="loading" class="list-div">
          <el-row
            v-for="item in conversationList"
            :key="item.id"
            class="list-item"
            :style="{ background: item.id === conversationId ? '#d1ffff' : 'white' }"
            @click="clickConversation(item.id, item.contactId)">
            <el-col :span="6">
              <el-avatar :size="40" :src="imgUrl + item.picId" />
            </el-col>
            <el-col :span="16">
              {{ item.contactNickName }}
              <div class="list-item-content">{{ item.chatContent }}</div>
            </el-col>
            <el-col :span="2">
              <el-badge class="item" :value="item.notReceiveCount" :hidden="item.notReceiveCount == 0" :offset="[10, 5]"> </el-badge>
            </el-col>
          </el-row>
        </div>
      </el-col>
      <el-col v-loading="chatLoading" :span="18" style="display: flex; flex-direction: column; height: 100%">
        <div ref="chatRef" @scroll="onScroll" class="chat-content">
          <div v-for="item in chatList" :key="item.id">
            <div v-if="item.content.length > 0" style="max-width: 60%" :style="item.isSend ? { float: 'right' } : { float: 'left' }" class="chat-content-item">
              <div class="chat-content-title" :style="item.isSend ? { 'text-align': 'right' } : { 'text-align': 'left' }">
                {{ item.createTime }}
              </div>
              <div class="chat-content-message" :style="item.isSend ? { background: '#b5ffff' } : { background: 'gainsboro' }">
                <div>{{ item.content }}</div>
              </div>
            </div>
          </div>
          <div v-show="newEstBthShow" style="position: sticky; right: 0; bottom: 0">
            <el-button style="margin-left: 10px" type="danger" plain @click="showNewest">新消息↓</el-button>
          </div>
        </div>
        <div class="chat-input">
          <el-form class="commentDiv" ref="formRef" :model="chat" :rules="rules">
            <el-form-item prop="content">
              <el-input v-model="chat.content" :rows="4" type="textarea" maxlength="1000" show-word-limit />
            </el-form-item>
            <el-button size="small" type="primary" style="float: right" @click="send">发送</el-button>
          </el-form>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import request from '@/utils/request.js';
import { Search } from '@element-plus/icons-vue';

const route = useRoute();
const imgUrl = import.meta.env.VITE_IMG_URL;
let loading = ref(false);

let conversationList = ref([]);

let keyword = ref('');

const doSearch = () => {
  conversationList.value = [];
  getConversationList();
};

let conversationId = ref('');

const getConversationList = () => {
  loading.value = true;
  request.get('/message/conversation/list', { params: { keyword: keyword.value } }).then((result) => {
    conversationList.value = result.data;
    let id = route.query.id;
    if (id) {
      //高亮会话
      conversationId.value = id;
      //获取该会话私信数据
      let data = conversationList.value.find((c) => c.id === id);
      clickConversation(data.id, data.contactId);
    }
    loading.value = false;
  });
};

let chatList = ref([]);
const chatRef = ref(null);
let cursor = ref(0);
let newestCursor = ref(0);
let chatLoading = ref(false);

let chat = reactive({ contactId: '', content: '' });
const formRef = ref(null);
const rules = reactive({
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
});

let interval;

const clickConversation = (id, contactId) => {
  if (chat.contactId !== contactId) {
    chatList.value = [];
    chat.contactId = contactId;
    chat.content = '';
    conversationId.value = id;
    //查询私信消息数据
    getChatList();
    //轮询最新消息
    clearInterval(interval);
    interval = setInterval(() => {
      refreshNewestList('p');
    }, 2000);
  }
};

const getChatList = () => {
  chatLoading.value = true;
  request.get('/message/chat/list', { params: { conversationId: conversationId.value, contactId: chat.contactId, cursor: cursor.value } }).then((result) => {
    chatLoading.value = false;
    chatList.value.unshift(...result.data);
    if (result.data.length > 0) {
      cursor.value = result.data[0].id;
      nextTick(() => {
        chatRef.value.scrollTop = chatRef.value.scrollHeight;
      });
      newestCursor.value = result.data[result.data.length - 1].id;
    }
    conversationList.value.find((c) => c.id === conversationId.value).notReceiveCount = 0;
  });
};

const onScroll = () => {
  if (chatRef.value) {
    const div = chatRef.value;
    if (div.scrollTop <= 0 || div.scrollTop <= div.offsetHeight - div.clientHeight) {
      refreshChatList();
    }
  }
};

const refreshChatList = () => {
  chatLoading.value = true;
  request.get('/message/chat/list', { params: { contactId: chat.contactId, cursor: cursor.value } }).then((result) => {
    chatList.value.unshift(...result.data);
    if (result.data.length > 0) {
      cursor.value = result.data[0].id;
      chatRef.value.scrollTop = result.data.length;
    }
    chatLoading.value = false;
  });
};

const refreshNewestList = (type) => {
  request.get('/message/chat/newest', { params: { contactId: chat.contactId, cursor: newestCursor.value } }).then((result) => {
    chatList.value.push(...result.data);
    if (result.data.length > 0) {
      newestCursor.value = result.data[result.data.length - 1].id;
      if (type === 'p') {
        newEstBthShow.value = true;
      } else if (type === 'i') {
        nextTick(() => {
          chatRef.value.scrollTop = chatRef.value.scrollHeight;
        });
      }
    }
  });
};

const send = () => {
  formRef.value.validate((valid) => {
    if (!valid) {
      return false;
    }
    request.post('/message/chat/send', chat).then(() => {
      chat.content = '';
      refreshNewestList('i');
    });
  });
};

let newEstBthShow = ref(false);

const showNewest = () => {
  newEstBthShow.value = false;
  chatRef.value.scrollTop = chatRef.value.scrollHeight;
};

onMounted(() => {
  getConversationList();
});
</script>

<style scoped>
.container {
  height: calc(100vh - 180px);
}

.a {
  color: #d1ffff;
}

.left {
}

.right {
  width: 100%;
}

.search-div {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
}

.list-div {
  height: calc(100vh - 240px);
  overflow: auto;
}

.list-item {
  padding: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.list-item:hover {
  background-color: #f2f3f5;
}

.list-item-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  color: #8a919f;
}

.chat-content {
  flex-grow: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
}

.chat-content-item {
  margin: 5px;
}

.chat-content-title {
  font-size: 12px;
  color: grey;
}

.chat-content-message {
  border: 1px solid gray;
  border-radius: 10px;
}

.chat-content-message div {
  margin: 5px;
  word-wrap: break-word;
}

.chat-input {
  margin: 10px;
}
</style>
