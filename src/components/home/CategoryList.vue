<template>
  <div>
    <div v-for="item in list" :key="item.id" class="category" :style="{
      background: categoryId === item.id ? '#eaf2ff' : '',
      color: categoryId === item.id ? '#409eff' : 'gray',
    }" @click="categoryChange(item.id)">
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

const emit = defineEmits(["refresh-article-list"]);

let categoryId = ref("");
let list = ref([]);

const getIcon = (icon) => {
  return icons[icon] || null
}

const getList = () => {
  request.get("/article/home/category").then((result) => {
    list.value = result.data;
  });
};

const categoryChange = (id) => {
  categoryId.value = id;
  emit("refresh-article-list", id);
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
  margin: 10px 5px;
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
