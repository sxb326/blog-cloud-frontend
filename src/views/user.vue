<template>
    <el-container>
        <el-aside width="100px" class="left"></el-aside>
        <el-main class="user-main">
            <div v-loading="loading">
                <el-card shadow="never" class="user-info">
                    <div class="authorDiv">
                        <div class="authorInfo">
                            <el-avatar :size="45" :src="imgUrl + author.picUid" class="centered-item avatar" />
                            <div class="authorNickName">{{ author.nickName }}</div>
                        </div>
                    </div>
                </el-card>
                <el-card shadow="never" class="user-detail">详情内同</el-card>
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
import { useRoute } from 'vue-router';
const imgUrl = import.meta.env.VITE_IMG_URL;
const userId = useRoute().params.id;

let loading = ref(false)
let author = reactive({});

const getUserInfo = () => {
    loading.value = true;
    request.get('/auth/user/' + userId).then((result) => {
        Object.assign(author, result.data);
    });
    loading.value = false;
}

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
}

.user-detail {
    overflow: auto;
    height: calc(100vh - 260px);
    background-color: #fff;
}

.authorDiv {
    width: 100%;
    background-color: #fff;
    border-radius: 5px;
    height: calc(100vh - 90vh);
    display: flex;
    align-items: center;
}

.authorInfo {
    align-items: center;
    display: flex;
    margin-left: 30px;
}

.authorNickName {
    margin-left: 10px;
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