<template>
    <div class="message-content">
        <el-container>
            <el-aside class="container left">
                <div class="search-div">
                    <el-input v-model="keyword" style="width: 280px" placeholder="搜索联系人">
                        <template #append>
                            <el-button :icon="Search" @click="doSearch" />
                        </template>
                    </el-input>
                </div>
                <div v-loading="loading" class="list-div">
                    <el-row v-for="item in list" :key="item.uid" class="list-item"
                        @click="clickContact(item.contactUid)"
                        :style="{ background: item.contactUid === chat.contactUid ? '#d1ffff' : 'white' }">
                        <el-col :span="6">
                            <el-avatar :size="40" :src="imgUrl + item.picUid" />
                        </el-col>
                        <el-col :span="18">
                            {{ item.contactNickName }}
                            <div class="list-item-content">{{ item.chatContent }}</div>
                        </el-col>
                    </el-row>
                </div>
            </el-aside>
            <div class="right">
                <div>
                    <div ref="contentRef" class="chat-content">
                        <div v-for="item in contentList" :key="item.uid" style="width: 100%;">
                            <div v-if="item.content.length > 0" style="max-width: 80%;"
                                :style="item.isSend ? { 'float': 'right' } : { 'float': 'left' }"
                                class="chat-content-item">
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
                </div>
            </div>
        </el-container>
    </div>
</template>
<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue';
import request from '@/utils/request.js';
import { useRoute } from 'vue-router';
import { Search } from '@element-plus/icons-vue';

const route = useRoute();
const imgUrl = import.meta.env.VITE_IMG_URL;
let loading = ref(false)

let list = ref([]);

let keyword = ref('')

const doSearch = () => {
    list.value = []
    getList()
}

const getList = () => {
    loading.value = true;
    request.get('/message/chat/listContact', { params: { keyword: keyword.value } }).then((result) => {
        list.value = result.data;
        loading.value = false
    });
}

let interval;

const clickContact = (contactUid) => {
    clearInterval(interval)
    if (chat.contactUid !== contactUid) {
        contentList.value = []
        chat.contactUid = contactUid
        chat.content = ''
        getData('1')
        interval = setInterval(() => {
            getData('2')
        }, 1000);
    }

}

let contentList = ref([])
const contentRef = ref(null)

const getData = (type) => {
    request.get('/message/chat/listContent', { params: { contactUid: chat.contactUid } }).then(result => {
        contentList.value = result.data
        if (type === '1') {
            nextTick(() => {
                contentRef.value.scrollTop = contentRef.value.scrollHeight;
            });
        }
    })
}

let chat = reactive({ contactUid: '', content: '' })
const formRef = ref(null);
const rules = reactive({
    content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
})

const send = () => {
    formRef.value.validate((valid) => {
        if (!valid) {
            return false;
        }
        request.post('/message/chat/send', chat).then(() => {
            contentList.value = []
            chat.content = ''
            getData('1')
        })
    })
}
onMounted(() => {
    getList();
    let id = route.query.id;
    if (id) {
        chat.contactUid = id;
        getData('1')
    }
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
    width: 25%;
    border-right: 1px solid gainsboro;
}

.right {
    width: 100%;
    margin: 10px;
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
}

.chat-input {
    height: calc(20vh);
}
</style>