<template>
    <el-dialog v-model="dialogVisible" title="收藏夹" width="30%" :destroy-on-close="true"
               :close-on-click-modal="false">
        <el-table :data="list" ref="tableRef" :show-header="false" style="width: 100%">
            <el-table-column>
                <template #default="scope">
                    <span class="favorite-name">{{ scope.row.name }}</span>
                    <el-icon v-if="scope.row.isDefault" class="favorite-icon">
                        <Lock/>
                    </el-icon>
                    <el-tag type="primary" v-if="scope.row.isDefault">默认</el-tag>
                </template>
            </el-table-column>
            <el-table-column width="50">
                <template #default="scope">
                    <el-checkbox v-model="scope.row.collected" size="large" @change="change(scope.row)"/>
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <el-button text>新增收藏夹</el-button>
            <el-button type="primary" @click="save">确定</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import {ref} from "vue";
import request from '@/utils/request.js'
import {ElMessage} from "element-plus";

const dialogVisible = ref(false)
let articleId = ref('')
let list = ref([])
const emit = defineEmits(['refresh-collect'])

//多选框切换事件
const change = (data) => {
    list.value.forEach(i => {
        if (i.id !== data.id) {
            i.collected = false
        }
    })
    list.value.find(i => i.id === data.id).collected = data.collected
}

//保存收藏信息
const save = () => {
    let collected = list.value.find(i => i.collected)
    let favoriteId = ''
    if (collected) {
        favoriteId = collected.id
    }
    const param = {
        articleId: articleId.value,
        favoriteId: favoriteId
    }
    request.post('/article/collect/save', param).then(result => {
        if (!result) {
            return;
        }
        ElMessage({
            message: result.message,
            type: 'success',
        });
        emit('refresh-collect')
        dialogVisible.value = false
    })
}

const open = (id, data) => {
    articleId.value = id;
    list.value = data;
    dialogVisible.value = true;
};

defineExpose({
    open
})
</script>

<style scoped>
.favorite-name {
    font-size: 15px;
    font-weight: bold;
    margin-right: 10px;
}

.favorite-icon {
    margin-right: 10px;
}
</style>