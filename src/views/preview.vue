<template>
  <el-container v-loading="loading">
    <el-aside width="150px" class="aside-container left">
      <el-badge :value="article.likeCount" :max="999">
        <div class="left-btn" :style="{ background: article.liked ? '#409eff' : 'white', color: article.liked ? 'white' : 'black' }" @click="debounceLike(article.liked)">
          <el-icon size="20">
            <Pointer />
          </el-icon>
        </div>
      </el-badge>
      <el-badge :value="article.commentCount" :max="999">
        <div class="left-btn" @click="openComment(article.id)">
          <el-icon size="20">
            <ChatLineRound />
          </el-icon>
        </div>
      </el-badge>
      <el-badge :value="article.collectCount" :max="999">
        <div class="left-btn" :style="{ background: article.collected ? '#409eff' : 'white', color: article.collected ? 'white' : 'black' }" @click="debounceCollect(article.id)">
          <el-icon size="20">
            <Star />
          </el-icon>
        </div>
      </el-badge>
    </el-aside>
    <el-main ref="articleRef" class="main-container">
      <div class="title">
        <h1 style="font-size: 2.1em">{{ article.title }}</h1>
        <div class="article-stats">
          <div class="article-stat-item">
            <el-text type="info" class="author" @click="openUser(article.authorId)"> {{ article.authorName }} </el-text>
          </div>
          <div class="article-stat-item">
            <el-text type="info"> {{ article.createTime }}</el-text>
          </div>
          <div class="article-stat-item">
            <el-text type="info">
              <el-icon>
                <View />
              </el-icon>
              {{ article.clickCount }}
            </el-text>
          </div>
          <el-button v-if="article.isAuthor" class="editBtn" type="primary" text @click="edit">编辑 </el-button>
        </div>
      </div>
      <v-md-preview ref="previewRef" :text="article.content"></v-md-preview>
    </el-main>
    <el-aside width="300px" class="aside-container right">
      <el-card shadow="never">
        <template #header>作者</template>
        <div class="author-info" @click="openUser(article.authorId)">
          <el-avatar :size="45" :src="pictureUrl + author.picId" class="centered-item avatar" />
          <div class="author-nick-name">{{ author.nickName }}</div>
        </div>
        <div class="article-info">
          <el-statistic title="文章数" :value="author.articleCount" />
          <el-statistic title="阅读数" :value="author.clickCount" />
          <el-statistic title="点赞数" :value="author.likeCount" />
        </div>
      </el-card>
      <el-card shadow="never" class="directory-card">
        <template #header>目录</template>
        <div ref="directoryRef" class="directory-div">
          <div v-for="anchor in titles" :id="anchor.id" :key="anchor" @click="directoryClick(anchor)">
            <div class="directory-item" :style="{ padding: `5px 0 5px ${anchor.indent * 20}px` }">
              {{ anchor.title }}
            </div>
          </div>
        </div>
      </el-card>
    </el-aside>
    <CommentList ref="commentRef" @refresh-comment-count="refreshCommentCount"></CommentList>
    <FavoriteForm ref="favoriteRef" @refresh-collect="refreshCollect"></FavoriteForm>
  </el-container>
</template>
<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue';
import request from '@/utils/request.js';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { debounce } from '@/utils/debounce.js';
import CommentList from '@/components/comment/CommentList.vue';
import FavoriteForm from '@/components/favorite/FavoriteForm.vue';
import { useTitleStore } from '@/store/modules/title.js';

const route = useRoute();
const router = useRouter();
const pictureUrl = ref(import.meta.env.VITE_APP_SERVICE_API + '/picture/');

let article = reactive({});
let author = reactive({});
let loading = ref(false);
let titles = ref([]);

//根据路径参数中的id 调用后端接口获取博客内容
const getArticle = () => {
  let id = route.params.id;
  article.id = id;
  if (id) {
    loading.value = true;
    request.get('/article/preview/' + id).then((result) => {
      if (result.code === '302') {
        ElMessage({
          message: result.message,
          type: 'warning',
        });
        router.push('/home');
        return;
      }
      //赋值文章和作者数据
      Object.assign(article, result.data);
      Object.assign(author, article.authorInfo);
      //设置Title
      useTitleStore().setTitle(article.title);
      //初始化目录
      nextTick(() => {directoryInit()})
      loading.value = false;
    });
  }
};

const previewRef = ref(null);

//初始化目录树
const directoryInit = () => {
  const anchors = previewRef.value.$el.querySelectorAll('h1,h2,h3,h4,h5,h6');
  const arr = Array.from(anchors).filter((title) => !!title.innerText.trim());
  if (!arr.length) {
    titles.value = [];
    return;
  }
  const hTags = Array.from(new Set(arr.map((title) => title.tagName))).sort();
  titles.value = arr.map((el) => ({
    id: 'directory-' + el.getAttribute('data-v-md-line'),
    title: el.innerText,
    lineIndex: el.getAttribute('data-v-md-line'),
    indent: hTags.indexOf(el.tagName),
    pixel: el.getBoundingClientRect().top - 60,
  }));
  //添加文章区域的滚动事件监听
  articleRef.value.$el.addEventListener('scroll', scrollEventListener);
};

//目录点击事件
const directoryClick = (anchor) => {
  const { id, lineIndex } = anchor;
  const heading = previewRef.value.$el.querySelector(`[data-v-md-line="${lineIndex}"]`);
  if (heading) {
    //跳转到对应的位置
    previewRef.value.scrollToTarget({
      target: heading,
      scrollContainer: document.querySelector('.main-container'),
      top: 60,
    });
    //高亮对应标题
    highlight(id);
  }
};

//根据传入的dom元素id 高亮对应标题
const highlight = (id) => {
  //首先移除所有的高亮
  directoryRef.value.querySelectorAll('div.highlight').forEach((element) => {
    element.classList.remove('highlight');
  });
  //再将目标元素高亮
  directoryRef.value.querySelector(`div[id="${id}"]`).classList.add('highlight');
};

//滚动事件监听
const scrollEventListener = debounce(() => {
  let pixel = articleRef.value.$el.scrollTop + articleRef.value.$el.offsetTop + 1;
  const title = titles.value.reduce((prev, curr) => {
    if (curr.pixel <= pixel && (prev === null || pixel - curr.pixel < pixel - prev.pixel)) {
      return curr;
    }
    return prev;
  }, null);
  if (title) {
    directoryRef.value.scrollTop = (directoryRef.value.scrollHeight * title.pixel) / articleRef.value.$el.scrollHeight;
    highlight(title.id);
  }
}, 100);

const articleRef = ref(null);
const directoryRef = ref(null);

onMounted(() => {
  getArticle();
});

const like = (liked) => {
  const param = { type: 1, objId: article.id, status: !liked };
  request.post('/article/like/save', param).then((result) => {
    if (!result) {
      return;
    }
    ElMessage({
      message: result.message,
      type: 'success',
    });
    article.likeCount = result.data;
    article.liked = !liked;
  });
};

const debounceLike = debounce(like, 200);

//评论
const commentRef = ref(null);

const openComment = (articleId) => {
  commentRef.value.open(articleId);
};

const refreshCommentCount = (count) => {
  article.commentCount = count;
};

const favoriteRef = ref();

//打开收藏夹
const collect = (articleId) => {
  //调用接口 查询用户的收藏夹数据
  request.get('/article/favorite/list/' + articleId).then((result) => {
    if (result) {
      favoriteRef.value.open(articleId, result.data);
    }
  });
};

const debounceCollect = debounce(collect, 200);

//刷新文章收藏数
const refreshCollect = () => {
  request.get('/article/collectCount/' + article.id).then((result) => {
    const collectCount = result.data;
    article.collected = collectCount >= article.collectCount;
    article.collectCount = collectCount;
  });
};

//编辑文章
const edit = () => {
  router.push('/editor/' + article.id);
};

const openUser = (id) => {
  window.open(window.location.origin + '/#/user/' + id);
};
</script>

<style>
.el-card__body {
  padding: 10px;
}
</style>
<style scoped>
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
  text-align: left;
}

.aside-container {
  height: calc(100vh - 100px);
  overflow-y: auto;
  padding-bottom: 50px;
  position: relative;
  border-radius: 5px;
}

.left {
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.right {
  margin-left: 20px;
}

.left-btn {
  border: 1px solid #000000;
  padding: 15px;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 40px;
}

.left-btn:hover {
  color: white !important;
  background: #84beff !important;
}

.author-info {
  align-items: center;
  display: flex;
  margin-left: 30px;
  cursor: pointer;
}

.article-info {
  width: 100%;
  display: flex;
  margin-top: 10px;
}

.article-info > * {
  text-align: center;
  flex: 3;
}

.author-nick-name {
  margin-left: 10px;
}

.directory-card {
  margin-top: 20px;
}

.directory-div {
  width: 100%;
  background-color: #fff;
  border-radius: 5px;
  height: calc(100vh - 450px);
  text-align: left;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 5px;
  font-size: 14px;
}

.directory-item {
  cursor: pointer;
  margin: 0 0 0 20px;
}

.directory-item:hover {
  color: rgba(64, 158, 255, 0.93) !important;
}

.main-container:hover::-webkit-scrollbar-thumb {
  display: block;
}

.directory-div:hover::-webkit-scrollbar-thumb {
  display: block;
}

.title {
  padding: 0 32px;
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

.author {
  cursor: pointer;
}

.author:hover {
  color: #84beff;
}

.el-drawer__header {
  margin-bottom: 0px !important;
}

.editBtn {
  margin-left: auto;
}

.highlight {
  color: #409eff;
  border-left: 2px solid #007bff;
}
</style>
