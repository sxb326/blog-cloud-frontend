<template>
  <el-container>
    <el-aside width="180px" class="aside-container left">
      <el-card shadow="never">
        <template #header>分类</template>
        <CategoryList @refresh-article-list="refreshArticleListByCategoryId"></CategoryList>
      </el-card>
    </el-aside>
    <el-main class="main-container">
      <articleList ref="articleListRef"></articleList>
    </el-main>
    <el-aside width="220px" class="aside-container right">
      <el-card shadow="never">
        <template #header>文章榜</template>
        111
      </el-card>
      <el-card shadow="never">
        <template #header>作者榜</template>
        222
      </el-card>
    </el-aside>
  </el-container>
</template>
<script setup>
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

.left .el-card__body {
  padding: 10px;
}

.left .category {
  text-align: center;
}

.main-container {
  border-radius: 5px;
  height: calc(100vh - 100px);
  flex: 1;
  padding: 0;
  background-color: #fff;
}

.aside-container {
  overflow-y: auto;
  position: relative;
  border-radius: 5px;
}

.left {
  margin-right: 20px;
}

.left .el-card {
  height: calc(100vh - 20vh);
}

.right {
  margin-left: 20px;
}

.right .el-card {
  margin-bottom: 20px;
  height: calc(100vh - 62vh);
}

.right .el-card:last-child {
  margin-bottom: 0;
}
</style>
