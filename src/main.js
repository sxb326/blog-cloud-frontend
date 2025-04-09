import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// 路由
import router from '@/router';
// element-plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// pinia
import { createPinia } from 'pinia';
// 配置全局api
import api from '@/api';
// 全局组件注册
import components from '@/components/index';
// md编辑器
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
// 代码行号
import createLineNumbertPlugin from '@kangc/v-md-editor/lib/plugins/line-number/index';
// 快捷复制代码
import createCopyCodePlugin from '@kangc/v-md-editor/lib/plugins/copy-code/index';
import '@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css';

// highlightjs
import hljs from 'highlight.js';

// 创建应用
const app = createApp(App);

// 使用路由
app.use(router);

// 使用ElementPlus
app.use(ElementPlus);

// 注册ElementPlus所有图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 使用pinia
app.use(createPinia());

// 配置全局api
app.config.globalProperties.$api = api

// 全局组件注册
Object.keys(components).forEach((key) => {
  app.component(key, components[key]);
});

// md编辑器
VMdEditor.use(githubTheme, {
    Hljs: hljs,
});

// 代码行号
VMdEditor.use(createLineNumbertPlugin())

// 快捷复制代码
VMdEditor.use(createCopyCodePlugin())
app.use(VMdEditor);

// md预览
VMdPreview.use(githubTheme, {
    Hljs: hljs,
});

// 代码行号
VMdPreview.use(createLineNumbertPlugin())

// 快捷复制代码
VMdPreview.use(createCopyCodePlugin())

// 使用md预览组件
app.use(VMdPreview);

// 挂载应用
app.mount('#app')
