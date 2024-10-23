<template>
    <el-row v-loading.fullscreen.lock="loading" class="rowDiv">
        <el-col :span="20">
            <el-input v-model="blog.title" size="large" placeholder="请输入文章标题"></el-input>
        </el-col>
        <el-col :span="4" class="btnDiv">
            <el-button type="warning" plain @click="saveDraft">保存草稿</el-button>
            <el-button type="primary" @click="publish">发布文章</el-button>
        </el-col>
    </el-row>
    <v-md-editor v-model="blog.content" height="calc(100vh - 100px)" :disabled-menus="[]" :toc-nav-position-right="true"
        :default-show-toc="true" @upload-image="uploadImage"></v-md-editor>
    <el-dialog v-model="visible" title="发布文章" :close-on-click-modal="false" width="500">
        <el-form ref="formRef" :model="blog" :rules="rules" label-width="auto" style="max-width: 600px">
            <el-form-item label="分类" label-width="80px" prop="categoryId">
                <el-select v-model="blog.categoryId" placeholder="选择分类" style="width: 240px">
                    <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="标签" label-width="80px" prop="tagIds">
                <el-select v-model="blog.tagIds" placeholder="选择标签" style="width: 240px" multiple multiple-limit="3">
                    <el-option v-for="item in tags" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
            </el-form-item>
            <el-form-item label="封面" label-width="80px">
                <el-upload v-model:file-list="coverList" action="#" list-type="picture-card" :auto-upload="false"
                    :limit="1" :on-change="upload" :on-remove="deletePic">
                    <el-icon>
                        <Plus />
                    </el-icon>
                </el-upload>
            </el-form-item>
            <el-form-item label="简介" label-width="80px" prop="summary">
                <el-input v-model="blog.summary" style="width: 240px" :rows="2" type="textarea" placeholder="请输入简介"
                    maxlength="100" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="doPublish">发布</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { useRoute, useRouter } from 'vue-router';
import request from '@/utils/request.js'
import { ElMessage } from "element-plus";

let blog = reactive({});

const route = useRoute();
const router = useRouter();

//初始化时加载
let loading = ref(false)

//发布文章弹窗
let visible = ref(false);

//分类数组
let categories = ref([]);

//标签数组
let tags = ref([]);

const publish = () => {
    if (!blog.title || !blog.content) {
        ElMessage({
            message: '标题或正文不能为空',
            type: 'warning',
        });
        return false;
    }
    //获取分类、标签数据
    request.get('/web/category/list').then(result => {
        categories.value = result.data;
    })
    request.get('/web/tag/list').then(result => {
        tags.value = result.data;
    })
    blog.summary = blog.content.substring(0, 100);
    visible.value = true;
}

const formRef = ref(null);

//发布文章
const doPublish = () => {
    formRef.value.validate((valid) => {
        if (!valid) {
            return false;
        }
        request.post('/web/blog/publish', blog).then(result => {
            ElMessage({
                message: result.message,
                type: 'success',
            });
            router.push('/home')
        })
    });
}

//上传博客封面回调
const upload = (file) => {
    var formData = new FormData();
    formData.append("file", file.raw);
    request.post('/picture/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(result => {
        blog.picId = result.data;
        coverList.value = []
        coverList.value.push({ name: 'cover-' + blog.picId, url: imgUrl + blog.picId })
    });
}

//删除封面图片
const deletePic = () => {
    blog.picId = ''
}

const rules = reactive({
    categoryId: [{ required: true, message: '请选择分类', trigger: 'blur' }],
    tagIds: [{ required: true, message: '请选择标签', trigger: 'blur' }],
    summary: [{ required: true, message: '请输入简介', trigger: 'blur' }]
})

//根据路径参数中的id 调用后端接口获取博客内容
const getBlog = () => {
    let id = route.params.id;
    blog.id = id;
    if (id) {
        loading.value = true
        request.get('/web/blog/' + id).then(result => {
            if (result.code === '302') {
                ElMessage({
                    message: result.message,
                    type: 'warning',
                });
                router.push('/home')
                return;
            }
            Object.assign(blog, result.data);
            if (blog.picId) {
                coverList.value.push({ name: 'cover-' + blog.picId, url: imgUrl + blog.picId })
            }
            loading.value = false
        })
    }
}

//保存草稿
const saveDraft = () => {
    if (!blog.title || !blog.content) {
        ElMessage({
            message: '标题或正文不能为空',
            type: 'warning',
        });
        return false;
    }
    request.post('/web/draft/save', blog).then(result => {
        blog.id = result.data
        ElMessage({
            message: result.message,
            type: 'success',
        });
    })
}

const saveKeyListener = ref(null);

const handleSaveKeydown = (event) => {
    if (event.ctrlKey && event.key === 's') {
        saveDraft();
    }
};

const imgUrl = import.meta.env.VITE_IMG_URL;
let coverList = ref([])

//按下保存时的监听
onMounted(() => {
    getBlog();
    saveKeyListener.value = window.addEventListener('keydown', handleSaveKeydown);
})

//销毁监听器
onUnmounted(() => {
    window.removeEventListener('keydown', saveKeyListener.value);
});

//上传图片回调
const uploadImage = (event, insertImage, files) => {
    //调用图片上传服务 并回写图片相关信息
    var formData = new FormData();
    formData.append("file", files[0]);
    request.post('/picture/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(result => {
        insertImage({
            url: import.meta.env.VITE_APP_SERVICE_API + '/picture/' + result.data,
            desc: 'img',
        });
    });
}

</script>

<style scoped>
.rowDiv {
    padding: 15px;
}

.btnDiv {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>