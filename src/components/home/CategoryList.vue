<template>
  <div>
    <div
      v-for="item in list"
      :key="item.uid"
      class="category"
      :style="{
        background: categoryUid === item.uid ? '#eaf2ff' : '',
        color: categoryUid === item.uid ? '#409eff' : '',
      }"
      @click="categoryChange(item.uid)"
    >
      {{ item.name }}
    </div>
  </div>
</template>

<script setup>
import request from "@/utils/request.js";
import { onMounted, ref } from "vue";

const emit = defineEmits(["refresh-blog-list"]);

let categoryUid = ref("");
let list = ref([]);

const getList = () => {
  request.get("/web/home/category").then((result) => {
    list.value.push({ uid: "", name: "综合" });
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
  margin: 20px 10px;
}

.category:hover {
  background: #f2f3f5;
  color: #409eff;
}
</style>
