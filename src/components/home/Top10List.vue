<template>
    <div>
        <div class="title">文章榜</div>
        <div v-for="item, index in list" :key="item.uid" class="top">
            <div class="top-index">
                <el-tag size="small" :type="getType(index)" round>{{ index + 1 }}</el-tag>
            </div>
            <div class="top-title" @click="preview(item.uid)">
                {{ item.title }}
            </div>
        </div>
    </div>
</template>

<script setup>
import request from "@/utils/request.js";
import { onMounted, ref } from "vue";

let list = ref([])

const getList = () => {
    request.get("/web/home/top10").then((result) => {
        list.value = result.data
    });
};

const preview = (id) => {
    window.open(window.location.origin + "/#/preview/" + id);
};

const getType = (index) => {
    if (index === 0) {
        return "danger";
    }
    if (index === 1) {
        return "warning"
    }
    return "info"
}

onMounted(() => {
    getList();
});
</script>

<style scoped>
.title {
    font-weight: bold;
    font-size: 16px;
    margin: 10px 0 15px 0;
}

.top {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
}

.top-index {
    flex: 2;
    font-weight: bold;
}

.top-title {
    flex: 8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 15px;
    cursor: pointer;
    text-align: left;
}

.top-title:hover {
    color: #409eff;
}
</style>