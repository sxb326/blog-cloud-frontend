<template>
    <div v-infinite-scroll="load" v-loading="loading" class="message-content" infinite-scroll-distance="10"
        infinite-scroll-immediate="false">
        <div v-if="list.length > 0">
            <div v-for="item in list" :key="item.id">
                <el-row v-if="item.content === null" class="message-item" :gutter="20">
                    <el-col :span="1">
                        <el-avatar :size="40" :src="imgUrl + item.sendUserPicId" class="centered-item avatar" />
                    </el-col>
                    <el-col :span="23">
                        <span class="authorSpan" @click="openUser(item.sendUserId)">{{ item.sendUserNickName }}</span>
                        <span style="color: gray;">点赞了</span>
                        <span v-if="item.commentId === null">
                            您的文章：<span class="articleTitleSpan" @click="jumpToPreview(item.articleId)">《{{ item.articleTitle
                                }}》</span>
                        </span>
                        <span v-else>
                            您在文章
                            <span class="articleTitleSpan" @click="jumpToPreview(item.articleId)">《{{ item.articleTitle
                                }}》</span>
                            中的评论：<div class="commentContent">{{ item.commentContent }}</div>
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
</template>
<script setup>
import { onMounted, ref } from 'vue';
import request from '@/utils/request.js';

const imgUrl = import.meta.env.VITE_IMG_URL;

let list = ref([]);

let page = ref(1);

let loading = ref(false)

const load = () => {
    page.value++;
    getList();
};

const getList = () => {
    loading.value = true;
    request.get('/message/list', { params: { type: 1, page: page.value } }).then((result) => {
        list.value.push(...result.data);
        if (result.data.length == 0) {
            page.value--;
        }
        loading.value = false
    });
};

const jumpToPreview = (articleId) => {
    window.open(window.location.origin + "/preview/" + articleId);
}

const openUser = (id) => {
    window.open(window.location.origin + "/user/" + id);
}



onMounted(() => {
    getList();
});
</script>