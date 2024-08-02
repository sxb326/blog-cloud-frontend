<template>
    <div v-if="total > 0" class="blogList" v-infinite-scroll="load" infinite-scroll-distance="10"
        infinite-scroll-immediate="false" v-loading="loading">
        <div class="blog" v-for="item in list" :key="item.uid" @click="preview(item.uid)">
            <div style="width: 100%">
                <h3 v-html="item.title"></h3>
                <p class="blog-summary">{{ item.summary }}</p>
                <div class="blog-stats">
                    <div class="blog-stat-item">
                        <span class="author">{{ item.authorName }}</span>
                    </div>
                    <div class="blog-stat-item">|</div>
                    <div class="blog-stat-item">
                        <span><el-icon class="stat-icon">
                                <View />
                            </el-icon></span>
                        <span>{{ item.clickCount }}</span>
                    </div>
                    <div class="blog-stat-item">
                        <span><el-icon class="stat-icon">
                                <Pointer />
                            </el-icon></span>
                        <span>{{ item.likeCount }}</span>
                    </div>
                    <div class="blog-stat-item">
                        <span><el-icon class="stat-icon">
                                <Star />
                            </el-icon></span>
                        <span>{{ item.collectCount }}</span>
                    </div>
                </div>
            </div>
            <div class="coverDiv" v-if="item.picUid !== null">
                <img :src="imgUrl + item.picUid" style="width:120px;height:120px" />
            </div>
        </div>
    </div>
    <el-empty v-else description="没有结果" />
</template>

<script setup>
import { defineProps, onMounted, ref } from "vue";
import request from '@/utils/request.js'

const imgUrl = import.meta.env.VITE_IMG_URL;

const props = defineProps({
    keyword: { type: String, required: true }
})

let page = ref(1)

const load = () => {
    page.value++
    getList()
}

let total = ref(0)
let list = ref([])
let loading = ref(false)

//检索数据
const getList = () => {
    loading.value = true
    request.get('/search/blog/search', {
        params: { keyword: props.keyword, page: page.value }
    }).then(result => {
        total.value = result.data.total
        list.value.push(...result.data.list)
        loading.value = false
    })
}

const preview = (id) => {
    window.open(window.location.origin + '/#/preview/' + id)
}

onMounted(() => {
    getList()
})
</script>

<style scoped>
.blogList {
    overflow: auto;
    height: calc(100vh - 100px);
    padding: 10px 5px;
}

.blog {
    cursor: pointer;
    display: flex;
    margin: 0 0.5rem;
    padding: 10px;
}

.blog:hover {
    background-color: #f2f3f5;
}

.blog-summary {
    font-size: 12px;
    color: lightgray;
}

.blog-stats {
    display: flex;
}

.blog-stat-item {
    display: flex;
    align-items: center;
    margin-right: 10px;
    font-size: 14px;
    color: darkgray;
}

.blog-stat-item span:first-child {
    margin-right: 5px;
}

.stat-icon {
    margin-top: 0.5rem;
}

.coverDiv {
    margin: 0.6rem 0.8rem 0 0.8rem;
}

.author {}

.author:hover {
    color: #409eff;
}
</style>