<template>
  <div>
    <div v-for="item in list" :key="item.uid" class="category" :style="{
      background: categoryUid === item.uid ? '#eaf2ff' : '',
      color: categoryUid === item.uid ? '#409eff' : 'gray',
    }" @click="categoryChange(item.uid)">
      <div class="category-icon">
        <el-icon :size="20">
          <component :is="getIcon(item.icon)"></component>
        </el-icon>
      </div>
      <div class="category-name">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import request from "@/utils/request.js";
import { onMounted, ref } from "vue";
import * as icons from "@element-plus/icons-vue";

const emit = defineEmits(["refresh-blog-list"]);

let categoryUid = ref("");
let list = ref([]);

const getIcon = (icon) => {
  return icons[icon] || null
}

const getList = () => {
  request.get("/web/home/category").then((result) => {
    list.value.push({ uid: "", name: "综合", icon: 'Discount' });
    list.value.push(...result.data);
  });
};

const categoryChange = (uid) => {
  categoryUid.value = uid;
  emit("refresh-blog-list", uid);
};

onMounted(() => {
  getList();
});
</script>

<style scoped>
.category {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50px;
  cursor: pointer;
  margin: 10px;
}

.category:hover {
  background: #f2f3f5;
  color: #409eff !important;
}

.category-icon {
  flex: 3;
}

.category-name {
  flex: 7;
  text-align: left;
}
</style>
