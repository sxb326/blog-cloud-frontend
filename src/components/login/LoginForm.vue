<template>
  <el-dialog v-model="visible" title="登录/注册" width="30%" :destroy-on-close="true">
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="auto" style="max-width: 600px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" />
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button type="primary" @click="login">登录</el-button>
        <el-button @click="close">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { reactive, ref } from 'vue';
import request from '@/utils/request';
import { ElMessage } from 'element-plus';

// 对外提供open方法 由父组件控制表单显隐
const visible = ref(false);
const open = () => {
  visible.value = true;
};
defineExpose({ open });

// 登录表单
let form = reactive({});
const formRef = ref(null);

// 表单校验
const formRules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

// 自定义事件 通知父组件刷新页面
const emit = defineEmits(['refresh']);

//登录方法
const login = () => {
  formRef.value.validate((valid) => {
    if (!valid) {
      return false;
    }
    request.post('/login', form).then((result) => {
      const { code, message } = result;
      if (code === '0') {
        ElMessage({
          message: message,
          type: 'success',
        });
        // 登录成功 通知父组件刷新页面
        emit('refresh');
        close();
        return;
      }
      ElMessage({
        message: message,
        type: 'error',
      });
    });
  });
};

// 关闭当前表单
const close = () => {
  form.username = '';
  form.password = '';
  visible.value = false;
};
</script>

<style scoped></style>
