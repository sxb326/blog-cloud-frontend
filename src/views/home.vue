<template>
  <el-container>
    <el-aside width="180px" class="aside-container left">
      <CategoryList @refresh-article-list="refreshArticleListByCategoryId"></CategoryList>
    </el-aside>
    <el-main class="main-container">
      <articleList ref="articleListRef"></articleList>
    </el-main>
    <el-aside width="220px" class="aside-container right">
    </el-aside>
  </el-container>
</template>
<script setup>
import articleList from '@/components/home/ArticleList.vue';
import CategoryList from '@/components/home/CategoryList.vue';
import { ref } from 'vue';

const articleListRef = ref(null);

const refreshArticleListByCategoryId = (categoryId) => {
  articleListRef.value.refreshArticleListByCategoryId(categoryId);
};
</script>
<style>
.el-container {
  display: flex;
  align-items: stretch;
}

.main-container {
  border-radius: 5px;
  height: calc(100vh - 100px);
  flex: 1;
  padding: 0;
  background-color: #fff;
}

.aside-container {
  text-align: center;
  overflow-y: auto;
  background-color: #fff;
  padding-bottom: 50px;
  position: relative;
  border-radius: 5px;
}

.left {
  margin-right: 20px;
  height: calc(100vh - 30vh);
}

.right {
  margin-left: 20px;
  height: calc(100vh - 30vh);
}
</style>
