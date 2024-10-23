<template>
    <div v-infinite-scroll="load" v-loading="loading" class="message-content" infinite-scroll-distance="10"
        infinite-scroll-immediate="false">
        <div v-if="list.length > 0">
            <div class="message-item" v-for="item in list" :key="item.id">
                {{ item.content }}
            </div>
        </div>
        <el-empty v-else description="没有消息"></el-empty>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import request from '@/utils/request.js';

// const imgUrl = import.meta.env.VITE_IMG_URL;

let list = ref([]);

let page = ref(1);

let loading = ref(false)

const load = () => {
    page.value++;
    getList();
};

const getList = () => {
    loading.value = true;
    request.get('/message/list', { params: { type: 6, page: page.value } }).then((result) => {
        list.value.push(...result.data);
        if (result.data.length == 0) {
            page.value--;
        }
        loading.value = false
    });
};

onMounted(() => {
    getList();
});
</script>