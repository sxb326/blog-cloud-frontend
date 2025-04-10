<template>
  <el-drawer v-model="drawerVisible" :title="'评论（' + count + '）'" direction="rtl" :destroy-on-close="true" @closed="closed">
    <el-row>
      <el-col :span="3">
        <el-avatar :size="40" :src="pictureUrl + picId" class="centered-item avatar" style="margin-top: 15px" />
      </el-col>
      <el-col :span="21">
        <CommentBox style="margin-bottom: 20px" :article-id="articleId" :parent-id="'0'" :reply-to-id="''" :comment-placeholder="'评论一下吧'" @refresh-comment="refreshComment"></CommentBox>
      </el-col>
    </el-row>
    <div v-infinite-scroll="load" infinite-scroll-distance="10" infinite-scroll-immediate="false" v-loading="loading" style="overflow: auto; height: calc(100vh - 240px)">
      <div v-for="(item, index) in data" :key="item.id">
        <el-row class="comment">
          <el-col :span="3">
            <el-avatar :size="35" :src="pictureUrl + item.userPicId" class="centered-item avatar" />
          </el-col>
          <el-col :span="21">
            <el-row class="nickName" @click="openUser(item.userId)">
              {{ item.userNickName }}
              <el-tag v-if="item.isAuthor" size="small" type="primary" style="margin-left: 5px">作者 </el-tag>
            </el-row>
            <el-row class="content">{{ item.content }}</el-row>
            <el-row class="bottom">
              {{ item.createTime }}
              <div class="article-stat-item">
                <span :style="{ color: item.liked ? '#409eff' : '' }">
                  <el-icon class="stat-icon" @click="debounceLike(item.id, item.liked, index)"> <Pointer /> </el-icon
                ></span>
                <span>{{ item.likeCount }}</span>
              </div>
              <div class="article-stat-item">
                <span :style="{ color: item.showBox ? '#409eff' : '' }"
                  ><el-icon class="stat-icon" @click="debounceComment(item.showBox, index)"> <ChatLineRound /> </el-icon
                ></span>
                <span>{{ item.commentCount }}</span>
              </div>
            </el-row>
            <CommentBox v-if="item.showBox" :article-id="articleId" :parent-id="item.id" :reply-to-id="''" :comment-placeholder="'回复 ' + item.userNickName + '：'" @refresh-comment="refreshComment">
            </CommentBox>
            <div v-if="item.subComments.length > 0" class="level2Comment">
              <el-row class="comment" v-for="(sub, si) in item.subComments" :key="sub.id">
                <el-col :span="3">
                  <el-avatar :size="30" :src="pictureUrl + sub.userPicId" class="centered-item avatar" />
                </el-col>
                <el-col :span="21">
                  <el-row v-if="sub.replyToUserId == null">
                    <span class="nickName" @click="openUser(sub.userId)"
                      >{{ sub.userNickName }}
                      <el-tag v-if="sub.isAuthor" size="small" type="primary">作者</el-tag>
                    </span>
                    ：{{ sub.content }}
                  </el-row>
                  <el-row v-else>
                    <span class="nickName" @click="openUser(sub.userId)"
                      >{{ sub.userNickName }}
                      <el-tag v-if="sub.isAuthor" size="small" type="primary">作者</el-tag>
                    </span>
                    &nbsp;回复&nbsp;
                    <span class="nickName" @click="openUser(sub.replyToUserId)"
                      >{{ sub.replyToUserNickName }}
                      <el-tag v-if="sub.isReplyToAuthor" size="small" type="primary">作者</el-tag>
                    </span>
                    ：{{ sub.content }}
                  </el-row>
                  <el-row class="bottom">
                    <el-col :span="7">{{ sub.createTime }}</el-col>
                    <el-col :span="2" class="article-stat-item">
                      <span :style="{ color: sub.liked ? '#409eff' : '' }">
                        <el-icon class="stat-icon" @click="debounceLike(sub.id, sub.liked, index, si)">
                          <Pointer />
                        </el-icon>
                      </span>
                      <span>{{ sub.likeCount }}</span>
                    </el-col>
                    <el-col :span="2" class="article-stat-item">
                      <span :style="{ color: sub.showBox ? '#409eff' : '' }">
                        <el-icon class="stat-icon" @click="debounceComment(sub.showBox, index, si)">
                          <ChatLineRound />
                        </el-icon>
                      </span>
                      <span>{{ sub.commentCount }}</span>
                    </el-col>
                    <el-col :span="10"></el-col>
                  </el-row>
                  <CommentBox
                    v-if="sub.showBox"
                    :article-id="articleId"
                    :parent-id="item.id"
                    :reply-to-id="sub.id"
                    :comment-placeholder="'回复 ' + sub.userNickName + '：'"
                    @refresh-comment="refreshComment"></CommentBox>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { computed, ref } from 'vue';
import request from '@/utils/request.js';
import { ElMessage } from 'element-plus';
import { debounce } from '@/utils/debounce.js';
import CommentBox from '@/components/comment/CommentBox.vue';
import { useAuthStore } from '@/store/modules/auth.js';

const drawerVisible = ref(false);
const pictureUrl = ref(import.meta.env.VITE_APP_SERVICE_API + '/picture/');
let authUser = computed(() => useAuthStore().authUser);
const picId = authUser.value ? authUser.value.picId : '';

let articleId = ref('');
let count = ref(0);
let page = ref(1);
let data = ref([]);
let loading = ref(false);

const load = () => {
  page.value++;
  getData();
};

const open = (id) => {
  articleId.value = id;
  getData();
  drawerVisible.value = true;
};

const getData = () => {
  loading.value = true;
  request.get('/article/preview/comment/' + articleId.value + '/' + page.value).then((result) => {
    count.value = result.data.count;
    data.value.push(...result.data.data);
    loading.value = false;
    if (result.data.data.length === 0) {
      page.value--;
    }
  });
};

const closed = () => {
  count.value = 0;
  data.value = [];
  page.value = 1;
};

const like = (id, liked, x, y) => {
  const param = { type: 2, objId: id, status: !liked };
  request.post('/article/like/save', param).then((result) => {
    if (!result) {
      return;
    }
    ElMessage({
      message: result.message,
      type: 'success',
    });
    if (y != undefined) {
      data.value[x].subComments[y].liked = !liked;
      data.value[x].subComments[y].likeCount = result.data;
    } else {
      data.value[x].liked = !liked;
      data.value[x].likeCount = result.data;
    }
  });
};

let showIndexs = [];

const comment = (showBox, x, y) => {
  showBox = showBox || false;

  showIndexs.forEach((a) => {
    if (a.y !== undefined) {
      data.value[a.x].subComments[a.y].showBox = false;
    } else {
      data.value[a.x].showBox = false;
    }
  });

  showIndexs = [];

  if (!showBox) {
    showIndexs.push({ x: x, y: y });
  }
  if (y != undefined) {
    data.value[x].subComments[y].showBox = !showBox;
  } else {
    data.value[x].showBox = !showBox;
  }
};

const debounceLike = debounce(like, 200);
const debounceComment = debounce(comment, 200);

const emit = defineEmits(['refresh-comment-count']);

//保存评论回调
const refreshComment = () => {
  //查看已保存评论的位置，如果为空。说明是顶部评论框。如果不为空 将对应子评论框隐藏
  if (showIndexs.length > 0) {
    let x = showIndexs[0].x;
    let y = showIndexs[0].y;
    showIndexs = [];
    //隐藏子评论框
    if (y !== undefined) {
      data.value[x].subComments[y].showBox = false;
    } else {
      data.value[x].showBox = false;
    }
    //根据父评论id重新获取评论数据
    request.get('/article/comment/' + articleId.value + '/' + data.value[x].id).then((result) => {
      data.value[x] = result.data.data[0];
      count.value = result.data.count;
      emit('refresh-comment-count', result.data.count);
    });
  } else {
    page.value = 1;
    request.get('/article/preview/comment/' + articleId.value + '/' + page.value).then((result) => {
      data.value = result.data.data;
      count.value = result.data.count;
      emit('refresh-comment-count', result.data.count);
    });
  }
};

const openUser = (id) => {
  window.open(window.location.origin + '/user/' + id);
};

defineExpose({
  open,
});
</script>

<style>
.el-drawer__header {
  margin-bottom: 0px !important;
}
</style>
<style scoped>
.comment {
  margin-bottom: 15px;
}

.level2Comment {
  margin-top: 15px;
}

.nickName {
  cursor: pointer;
}

.nickName:hover {
  color: #84beff;
}

.content {
  word-break: break-all;
  margin-top: 5px;
}

.bottom {
  color: darkgray;
  font-size: 16px;
  margin-top: 5px;
}

.stat-icon {
  margin-top: 0.2rem;
  cursor: pointer;
}

.stat-icon:hover {
  color: #84beff;
}

.article-stat-item {
  display: flex;
  align-items: center;
  margin-left: 10px;
  font-size: 14px;
  color: darkgray;
}

.article-stat-item span {
  margin-left: 1px;
}
</style>