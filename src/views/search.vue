<template>
  <el-container>
    <el-aside width="200px" class="search-aside left"></el-aside>
    <el-main class="search-main">
      <div v-loading="loading">
        <div class="total">查询到包含关键字"{{ keyword }}"的文章有{{ total }}篇</div>
        <div v-if="total > 0" class="list" v-infinite-scroll="load" infinite-scroll-distance="10"
          infinite-scroll-immediate="false">
          <div class="article-background" v-for="item in list" :key="item.id" @click="preview(item.id)">
            <div class="article">
              <div class="article-info">
                <div class="article-title" v-html="item.title"></div>
                <p class="article-summary">{{ item.summary }}</p>
                <div class="article-stats">
                  <div class="article-stat-item">
                    <el-text type="info" class="author" @click.stop="openUser(item.authorId)">{{ item.authorName
                      }}</el-text>
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
              <div class="coverDiv" v-if="item.picId !== null">
                <img :src="imgUrl + item.picId" style="width: 120px; height: 80px" />
              </div>
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
import { ref, onMounted } from 'vue';
import request from '@/utils/request.js';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

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
    .get('/search', {
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
  window.open(window.location.origin + '/#/preview/' + id);
};

//重新发起检索
const search = () => {
  page.value = 1;
  list.value = [];
  getList();
};

//监听路由变化
onBeforeRouteUpdate((route) => {
  keyword = route.params.keyword;
  search();
});

const openUser = (id) => {
  window.open(window.location.origin + "/#/user/" + id);
}

onMounted(() => {
  search();
});
</script>
<style>
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

.article {
  cursor: pointer;
  display: flex;
  margin: 0 0.5rem;
  padding: 10px;
  border-bottom: 1px solid #edeeef;
}

.article-background:hover {
  background-color: #f2f3f5;
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

.article-stats {
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
