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
                <div v-infinite-scroll="load" v-loading="loading" class="list-div" infinite-scroll-distance="10"
                    infinite-scroll-immediate="false">
                    <div v-for="item in list" :key="item.uid">
                        {{ item }}
                    </div>
                </div>
            </el-aside>
            <el-main class="right">Main</el-main>
        </el-container>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
import request from '@/utils/request.js';
import { Search } from '@element-plus/icons-vue';

let loading = ref(false)

let list = ref([]);
let page = ref(1);

let keyword = ref('')

const doSearch = () => {
    page.value = 1
    list.value = []
    getList()
}

const load = () => {
    page.value++;
    getList();
};

const getList = () => {
    loading.value = true;
    request.get('/message/chat/listContact', { params: { keyword: keyword.value, page: page.value } }).then((result) => {
        list.value.push(...result.data);
        if (result.data.length == 0) {
            page.value--;
        }
        loading.value = false
    });
}

onMounted(() => {
    getList();
});
</script>

<style scoped>
.container {
    height: calc(100vh - 180px);
}

.left {
    width: 25%;

}

.right {}

.search-div {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
}

.list-div {
    background: greenyellow;
    height: calc(100vh - 240px);
    overflow: auto;
}
</style>