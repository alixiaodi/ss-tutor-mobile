<div align="center">
  <div style="display: flex; align-items: center; justify-content: center;">
    <img src="static/preview/logo.png" width="80" height="80" alt="logo" style="margin-right: 20px"/>
    <h1>智考导师系统</h1>
  </div>
</div>

### 🚀 在线体验
- 官网地址：https://www.lics.asia

### 📱 项目简介
专注于为考生提供智能刷题服务
- 支持多端：H5、小程序、APP
- AI智能评分：自动判断答题正确性
- AI智能出题：根据知识点智能生成题目
- AI押题预测：基于大数据分析预测考点
- AI记题助手：智能生成个性化记忆方法

> **当前状态**：
> - 目前系统仅开放软件工程学科数据，其他学科数据正在逐步完善中
> - 欢迎各学科教师及专业人士提供相关资料，共同建设更完善的题库
> - AI模型训练进行中：正在针对软件工程领域进行深度训练，以提供更精准的答题指导服务

### 🎯 核心亮点
```
🤖 AI智能评分
- 自动判断答案正确性
- 快速反馈评分结果
- 智能分析答题要点
- 提供改进建议

📚 AI智能出题
- 知识点关联出题
- 难度智能调节
- 题型多样化
- 实时更新题库

🎯 AI押题预测
- 考点规律分析
- 重点题型预测
- 考试趋势分析
- 备考方向指导

📝 AI记题助手
- 智能生成记忆口诀
- 个性化记忆方法
- 知识点关联记忆
- 易错点强化记忆
```

### ⚡功能特色
1. **智能刷题系统**
   - AI自动评分
   - 实时答题反馈
   - 错题智能归类
   - 个性化练习推荐

2. **AI辅助备考**
   - 智能题目生成
   - 考点重点分析
   - 记忆方法生成
   - 针对性练习推荐

3. **学习追踪**
   - 做题进度跟踪
   - 正确率统计
   - 知识点掌握度
   - 学习时长记录

### 🔨 技术栈
| 技术 | 版本 | 说明 |
|------|------|------|
| uniapp | - | 跨平台开发框架 |
| vue2 | 2.x | 前端框架 |
| uview-ui | 2.0.31 | UI组件库 |
| qiun-data-charts | 2.4.3-20220505 | 图表组件 |
| @dcloudio/uni-ui | 1.5.7 | uni-app官方组件库 |
| sortablejs | 1.15.3 | 拖拽排序组件 |

### 📁 项目结构
```
├── api                        // 所有请求
├── components                 // 全局公用组件
├── pages                      // 页面文件
├── plugins                    // 通用方法
├── store                      // 全局store管理
├── utils                      // 公用方法
├── static                     // 公共文件
│   ├── favicon.ico            // favicon图标
│   └── index.html             // html模板
│   └── logo.png               // logo图片
├── uni_modules                // uniui组件
│   ├── uni-badge              // 数字角标
│   └── ...                    // 其他组件
├── App.vue                    // 应用配置
├── config.js                  // 环境配置
├── main.js                    // Vue初始化入口文件
├── manifest.json              // 配置打包
├── pages.json                 // 配置页面路由
├── permission.js              // 权限拦截
└── uni.scss                   // 全局样式变量
```

### ⚙️ 环境配置

1. 后端接口配置 (config/environment.js):
```js
const environment = {
  development: {
    baseURL: 'http://localhost:8080'  // 开发��境
  },
  production: {
    baseURL: 'https://api.lics.asia'  // 生产环境
  }
}
```

2. H5开发配置:
```js
// vue.config.js
module.exports = {
  devServer: {
    port: 9001,
    proxy: {
      '/': {
        target: environment.baseURL,
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/': ''
        }
      }
    }
  }
}
```

### 📱 功能预览
待添加

### 🤝 开发规范
- 遵循阿里巴巴前端开发规范
- 支持H5端适配
- 采用统一的命名规范和目录结构
- 兼容H5端开发

### 🙏 特别鸣谢

本项目基于 [RuoYi-App](https://gitee.com/y_project/RuoYi-App) 开发，感谢 RuoYi 开源社区的贡献。
