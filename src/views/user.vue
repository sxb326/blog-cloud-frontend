<template>
    <el-container>
        <el-aside width="100px" class="left"></el-aside>
        <el-main class="user-main">
            <div v-loading="loading">
                <div shadow="never" class="user-info">
                    <div class="author-div">
                        <div class="author-info">
                            <el-avatar :size="45" :src="imgUrl + author.picUid" class="centered-item avatar" />
                            <div class="author-nick-name">{{ author.nickName }}</div>
                        </div>
                        <div class="author-btn">
                            <el-button size="large" type="primary">关注</el-button>
                            <el-button size="large" :icon="ChatLineSquare" type="primary" plain>私信</el-button>
                        </div>
                    </div>
                </div>
                <div shadow="never" class="user-detail">
                    <el-tabs v-model="type" @tab-change="tabChange">
                        <el-tab-pane label="文章" name="article"></el-tab-pane>
                        <el-tab-pane label="专栏" name="column"></el-tab-pane>
                    </el-tabs>
                    <router-view />
                </div>
            </div>
        </el-main>
        <el-card shadow="never" class="right">
            <template #header>
                个人成就
            </template>
            <div class="achievement-div">
                <el-icon :size="25">
                    <List />
                </el-icon>
                <div class="achievement-text">文章数</div>
                <div class="achievement-value">{{ author.blogCount }}</div>
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
    </el-container>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue';
import request from '@/utils/request.js';
import { useRoute, useRouter } from 'vue-router';
import { ChatLineSquare } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();

const imgUrl = import.meta.env.VITE_IMG_URL;
const userId = route.params.id;
const type = route.name

let loading = ref(false)
let author = reactive({});

const getUserInfo = () => {
    loading.value = true;
    request.get('/auth/user/' + userId).then((result) => {
        Object.assign(author, result.data);
    });
    loading.value = false;
}

const tabChange = (tabName) => {
    router.replace(tabName)
};

onMounted(() => {
    getUserInfo()
})

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
    background-color: #fff;
    height: 200px;
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

.author-btn>* {
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