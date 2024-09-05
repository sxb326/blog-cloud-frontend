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
                    <el-row v-for="item in conversationList" :key="item.uid" class="list-item"
                        :style="{ background: item.contactUid === chat.contactUid ? '#d1ffff' : 'white' }"
                        @click="clickConversation(item.contactUid)">
                        <el-col :span="6">
                            <el-avatar :size="40" :src="imgUrl + item.picUid" />
                        </el-col>
                        <el-col :span="18">
                            {{ item.contactNickName }}
                            <div class="list-item-content">{{ item.chatContent }}</div>
                        </el-col>
                    </el-row>
                </div>
            </el-col>
            <el-col :span="18">
                <div ref="chatRef" @scroll="onScroll" class="chat-content">
                    <div v-for="item in chatList" :key="item.uid">
                        <div v-if="item.content.length > 0" style="max-width: 60%;"
                            :style="item.isSend ? { 'float': 'right' } : { 'float': 'left' }" class="chat-content-item">
                            <div class="chat-content-title"
                                :style="item.isSend ? { 'text-align': 'right' } : { 'text-align': 'left' }">
                                {{ item.createTime }}</div>
                            <div class="chat-content-message"
                                :style="item.isSend ? { 'background': '#b5ffff' } : { 'background': 'gainsboro' }">
                                <div>{{ item.content }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="chat-input">
                    <el-form class="commentDiv" ref="formRef" :model="chat" :rules="rules">
                        <el-form-item prop="content">
                            <el-input v-model="chat.content" :rows="4" type="textarea" maxlength="1000"
                                show-word-limit />
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
import request from '@/utils/request.js';
import { Search } from '@element-plus/icons-vue';

const imgUrl = import.meta.env.VITE_IMG_URL;
let loading = ref(false)

let conversationList = ref([]);

let keyword = ref('')

const doSearch = () => {
    conversationList.value = []
    getConversationList()
}

const getConversationList = () => {
    loading.value = true;
    request.get('/message/conversation/list', { params: { keyword: keyword.value } }).then((result) => {
        conversationList.value = result.data;
        loading.value = false
    });
}

let chatList = ref([])
const chatRef = ref(null)
let cursor = ref(0)

let chat = reactive({ contactUid: '', content: '' })
const formRef = ref(null);
const rules = reactive({
    content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
})

const clickConversation = (contactUid) => {
    if (chat.contactUid !== contactUid) {
        chatList.value = []
        chat.contactUid = contactUid
        chat.content = ''
        getChatList()
    }
}

const getChatList = () => {
    request.get('/message/chat/list', { params: { contactUid: chat.contactUid, cursor: cursor.value } }).then(result => {
        chatList.value.unshift(...result.data)
        cursor.value = result.data[0].uid
        nextTick(() => {
            chatRef.value.scrollTop = chatRef.value.scrollHeight;
        });
    })
}

const onScroll = () => {
    if (chatRef.value) {
        const div = chatRef.value;
        if (div.scrollTop <= 0 || div.scrollTop <= div.offsetHeight - div.clientHeight) {
            refreshChatList()
        }
    }
};

const refreshChatList = () => {
    request.get('/message/chat/list', { params: { contactUid: chat.contactUid, cursor: cursor.value } }).then(result => {
        chatList.value.unshift(...result.data)
        cursor.value = result.data[0].uid
    })
}


const send = () => {
    formRef.value.validate((valid) => {
        if (!valid) {
            return false;
        }
        request.post('/message/chat/send', chat).then(() => {
            chatList.value = []
            chat.content = ''
            getChatList()
        })
    })
}

onMounted(() => {
    getConversationList();
    // let id = route.query.id;
    // if (id) {
    //     chat.contactUid = id;
    //     getChatList()
    // }
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
    /* border-right: 1px solid gainsboro; */
}

.right {
    width: 100%;
    /* margin: 10px; */
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
    height: calc(50vh);
    overflow: auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    /* margin:10px */
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
    height: calc(20vh);
    margin: 10px;
}
</style>