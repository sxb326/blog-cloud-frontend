<template>
  <el-container>
    <el-aside width="200px" class="search-aside left"></el-aside>
    <el-main class="search-main">
        {{ list }}
    </el-main>
    <el-aside width="200px" class="search-aside right"></el-aside>
  </el-container>
</template>
<script setup>
import request from '@/utils/request.js'
import { onMounted, ref } from 'vue';
import {useRoute} from 'vue-router';

const route = useRoute();

let list = ref([])

onMounted(()=>{
    let keyword = route.params.keyword;
    request.get('/search/blog/search?keyword='+keyword).then(result=>{
        list.value = result.data
    })

})


</script>
<style scope>
body {
  background-color: #f2f3f5;
}

.el-container {
  display: flex;
  align-items: stretch;
}

.search-main {
  border-radius: 5px;
  height: calc(100vh - 100px);
  flex: 1;
  padding: 0;
  background-color: #fff;
}

.search-aside {
  text-align: center;
  height: calc(100vh - 100px);
  overflow-y: auto;
  padding-bottom: 50px;
  position: relative;
  border-radius: 5px;
}

.left {
  margin-right: 20px;
}

.right {
  margin-left: 20px;
}
</style>
