<template>
  <el-tabs v-model="orderType" class="tabDiv" @tab-change="tabChange">
    <el-tab-pane label="推荐" name="recommend"></el-tab-pane>
    <el-tab-pane label="最新" name="newest"></el-tab-pane>
  </el-tabs>
  <div v-infinite-scroll="load" v-loading="loading" class="articleList" infinite-scroll-distance="10"
    infinite-scroll-immediate="false">
    <div v-for="item in list" :key="item.id" class="article-background" @click="preview(item.id)">
      <div class="article">
        <div class="article-info">
          <div class="article-title">{{ item.title }}</div>
          <p class="article-summary">{{ item.summary }}</p>
          <div class="article-status">
            <div class="article-stat-item">
              <el-text type="info" class="author" @click.stop="openUser(item.authorId)">{{ item.authorName }}</el-text>
            </div>
            <div class="article-stat-item">
              <el-text type="info">
                <el-icon>
                  <View />
                </el-icon>
                {{ item.clickCount }}
              </el-text>
            </div>
            <div class="article-stat-item">
              <el-text type="info">
                <el-icon>
                  <Pointer />
                </el-icon>
                {{ item.likeCount }}
              </el-text>
            </div>
            <div class="article-stat-item">
              <el-text type="info">
                <el-icon>
                  <Star />
                </el-icon>
                {{ item.collectCount }}
              </el-text>
            </div>
            <div class="article-stat-item">
              <el-tag v-for="tag in item.tagNameList" :key="tag" type="info">{{ tag }}</el-tag>
            </div>
          </div>
        </div>
        <div class="article-cover" v-if="item.picId !== null">
          <img :src="imgUrl + item.picId" style="width: 120px; height: 80px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import request from "@/utils/request.js";

const imgUrl = import.meta.env.VITE_IMG_URL;

let list = ref([]);
let loading = ref(false);

let category = ref("");
let orderType = ref("recommend");

//页面变更回调
const tabChange = (tabName) => {
  orderType.value = tabName;
  list.value = [];
  page.value = 1;
  getList();
};

const getList = () => {
  loading.value = true;
  request
    .get("/search/list", {
      params: {
        page: page.value,
        categoryId: category.value,
        orderType: orderType.value,
      },
    })
    .then((result) => {
      list.value.push(...result.data);
      loading.value = false;
      if (result.data.length === 0) {
        page.value--;
      }
    });
};

let page = ref(1);

const load = () => {
  page.value++;
  getList();
};

onMounted(getList);

const preview = (id) => {
  console.log('window.location.origin',window.location.origin)
  window.open(window.location.origin + "/preview/" + id);
};

const refreshArticleListByCategoryId = (categoryId) => {
  category.value = categoryId;
  orderType.value = "recommend";
  page.value = 1;
  list.value = [];
  getList();
};

const openUser = (id) => {
  window.open(window.location.origin + "/user/" + id);
}

defineExpose({ refreshArticleListByCategoryId });
</script>

<style>
.el-tabs__header {
  margin: 0 !important;
}

.el-tabs__item {
  margin-left: 20px !important;
}

.el-tabs__active-bar {
  transform: translateX(20px);
}
</style>

<style scoped>
.tabDiv {
  padding: 5px 0 0 5px;
}

.articleList {
  overflow: auto;
  height: calc(100vh - 170px);
  padding: 0 5px;
}

.article-background:hover {
  background-color: #f2f3f5;
}

.article {
  cursor: pointer;
  display: flex;
  margin: 0 0.5rem;
  padding: 10px;
  border-bottom: 1px solid #edeeef;
}

.article-info {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-title {
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-summary {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  color: #8a919f;
}

.article-status {
  display: flex;
}

.article-stat-item {
  display: flex;
  align-items: center;
  margin-right: 10px;
  font-size: 14px;
  color: darkgray;
}

.article-stat-item span {
  margin-right: 5px;
}

.article-stat-item:last-child {
  margin-left: auto;
}

.article-cover {
  margin: 0.6rem 0.8rem 0 0.8rem;
}

.article-cover img {
  width: 100px;
  height: auto;
}

.author {}

.author:hover {
  color: #409eff;
}
</style>
