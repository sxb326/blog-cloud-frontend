<template>
  <el-container>
    <el-aside width="200px" class="search-aside left"></el-aside>
    <el-main class="search-main">
      <SearchList :keyword="keyword"></SearchList>
    </el-main>
    <el-aside width="200px" class="search-aside right"></el-aside>
  </el-container>
</template>
<script setup>
import { useRoute } from 'vue-router';
import SearchList from "@/components/search/SearchList.vue";

const route = useRoute();
const keyword = route.params.keyword;

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
