<template>
  <el-container>
    <el-aside width="200px" class="search-aside left"></el-aside>
    <el-main class="search-main">
      <div v-loading="loading">
        <div class="total">
          查询到包含关键字"{{ keyword }}"的文章有{{ total }}篇
        </div>
        <div
          v-if="total > 0"
          class="list"
          v-infinite-scroll="load"
          infinite-scroll-distance="10"
          infinite-scroll-immediate="false"
        >
          <div
            class="blog"
            v-for="item in list"
            :key="item.uid"
            @click="preview(item.uid)"
          >
            <div style="width: 100%">
              <h3 v-html="item.title"></h3>
              <p class="blog-summary">{{ item.summary }}</p>
              <div class="blog-stats">
                <div class="blog-stat-item">
                  <span class="author">{{ item.authorName }}</span>
                </div>
              </div>
            </div>
            <div class="coverDiv" v-if="item.picUid !== null">
              <img
                :src="imgUrl + item.picUid"
                style="width: 120px; height: 120px"
              />
            </div>
          </div>
        </div>
        <el-empty v-else description="没有结果" />
      </div>
    </el-main>
    <el-aside width="200px" class="search-aside right"></el-aside>
  </el-container>
</template>
<script setup>
import { ref, watch } from "vue";
import request from "@/utils/request.js";
import { useRoute } from "vue-router";

const imgUrl = import.meta.env.VITE_IMG_URL;
const route = useRoute();
let keyword = route.params.keyword;

let page = ref(1);

const load = () => {
  page.value++;
  getList();
};

let total = ref(0);
let list = ref([]);
let loading = ref(false);

//检索数据
const getList = () => {
  loading.value = true;
  request
    .get("/search", {
      params: { keyword: keyword, page: page.value },
    })
    .then((result) => {
      total.value = result.data.total;
      list.value.push(...result.data.list);
      loading.value = false;
      if (result.data.list.length === 0) {
        page.value--;
      }
    });
};

const preview = (id) => {
  window.open(window.location.origin + "/#/preview/" + id);
};

//重新发起检索
const search = () => {
  page.value = 1;
  list.value = [];
  getList();
};

//监听路由变化
watch(
  route,
  (route) => {
    keyword = route.params.keyword;
    search();
  },
  { immediate: true }
);
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

.total {
  background-color: #fff;
  margin-bottom: 20px;
  padding: 10px;
}

.list {
  overflow: auto;
  height: calc(100vh - 180px);
  padding: 10px 5px;
  background-color: #fff;
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

.author {
}

.author:hover {
  color: #409eff;
}
</style>
