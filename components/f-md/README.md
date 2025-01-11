# f-md

- z-md 是用于渲染 markdown 文本的，现在AI聊天用到的居多。
- 有行号、有复制、支持显示光标。
- 支持浅色、深色、自动主题，
- 支持**PC、H5、微信小程序、APP未测试。**
- 添加主题需要添加对应的class。
    - light 浅色
    - dark 深色
    - auto 自动
- [点击体验效果](https://chat.fanstars.cn)
- 如果你要接入AI聊天，可以使用[FanStarsApi](https://35.fanstars.cn/)，物美价廉，无需魔法，支持多种大模型，统一以OpenAi方式返回，支持（SD、MJ）画图，支持SUNO音乐生成等等，低至**0.8￥:1$**。

## 安装

```sh
npm install markdown-it highlight.js
```

## 使用

```vue
<view class="light">
    <f-md :content="'# 要渲染的内容'" :isStreaming="true">
    </f-md>
</view>
```
