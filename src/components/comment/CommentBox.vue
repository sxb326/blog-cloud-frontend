<template>
    <el-form class="commentDiv" ref="formRef" :model="comment" :rules="rules">
        <el-form-item prop="content">
            <el-input v-model="comment.content" :rows="3" type="textarea" :placeholder="placeholder" maxlength="1000"
                      show-word-limit/>
        </el-form-item>
        <el-button size="small" type="primary" style="margin-top: 5px;float: right" @click="save">发表</el-button>
    </el-form>
</template>

<script setup>
import {defineProps, onMounted, reactive, ref} from "vue";
import request from '@/utils/request.js'
import {ElMessage} from "element-plus";

let comment = reactive({articleId: '', parentId: '', replyToId: '', content: ''})
let placeholder = ref('')

const props = defineProps({
    articleId: {type: String, required: true},
    parentId: {type: String, required: true},
    replyToId: {type: String, required: true},
    commentPlaceholder: {type: String, required: true}
})

onMounted(() => {
    comment.articleId = props.articleId
    comment.parentId = props.parentId
    comment.replyToId = props.replyToId
    placeholder.value = props.commentPlaceholder
})

const rules = reactive({
    content: [{required: true, message: '请输入评论内容', trigger: 'blur'}]
})

const formRef = ref(null);

const emit = defineEmits(['refresh-comment'])

const save = () => {
    formRef.value.validate((valid) => {
        if (!valid) {
            return false;
        }
        request.post('/article/comment/save', comment).then(result => {
            if (!result) {
                return;
            }
            ElMessage({
                message: result.message,
                type: 'success',
            });
            comment.content = ''
            emit('refresh-comment')
        })
    });
}

</script>

<style scoped>
.commentDiv {
    margin: 5px;
}
</style>