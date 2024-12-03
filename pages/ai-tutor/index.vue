<template>
  <view class="ai-tutor">
    <view class="header">
      <u-navbar
        title="AI导师"
        :autoBack="true"
        bgColor="#4ECDB6"
        titleStyle="color: #ffffff; font-weight: 500;"
        fixed
        placeholder
      ></u-navbar>
    </view>

    <view class="content">
      <scroll-view
        scroll-y="true"
        class="chat-container"
        :scroll-top="scrollTop"
        :scroll-with-animation="true"
      >
        <view
          v-for="(item, index) in chatHistory"
          :key="index"
          :class="['message-item', item.type === 'user' ? 'user-msg' : 'ai-msg']"
        >
          <view class="avatar">
            <image
              :src="
                item.type === 'user' ? '/static/img/stu-avatar.png' : '/static/img/ai.png'
              "
              mode="aspectFill"
            />
          </view>
          <text class="message-content">{{ item.content }}</text>
        </view>
      </scroll-view>

      <view class="input-area">
        <u-input
          v-model="message"
          placeholder="请输入您想问的问题"
          border="surround"
          :clearable="true"
        >
          <template slot="suffix">
            <u-button
              @click="sendMessage"
              type="primary"
              size="mini"
              :disabled="!message.trim()"
              >发送</u-button
            >
          </template>
        </u-input>
      </view>
    </view>

    <view class="debug-info" style="display: none">
      <text>VIP状态: {{ isVip }}</text>
      <text>弹窗状态: {{ showVipPopup }}</text>
    </view>

    <vip-popup :show.sync="showVipPopup" @open="onPopupOpen" @close="onPopupClose" />
  </view>
</template>

<script>
import { mapState } from "vuex";
import VipPopup from "@/components/vip-popup/index.vue";

export default {
  components: {
    VipPopup,
  },
  computed: {
    ...mapState({
      userInfo: (state) => state.user.userInfo,
    }),
  },
  data() {
    return {
      message: "",
      chatHistory: [
        // 添加一些初始对话记录
        {
          type: "ai",
          content: "你好！我是你的AI导师，有什么我可以帮你的吗？",
        },
        {
          type: "user",
          content: "你好，我想请教一个问题",
        },
        {
          type: "ai",
          content: "当然可以，请问你想了解什么？我会尽力为你解答。",
        },
      ],
      scrollTop: 0,
      isVip: false,
      // 模拟VIP用户数据
      demoUserInfo: {
        isVip: false, // 设置为非VIP用户
        vipExpireDate: "2024-12-31",
        nickname: "测试用户",
      },
      showVipPopup: false, // 控制VIP弹窗显示
    };
  },
  onShow() {
    this.checkVipStatus();
  },
  methods: {
    async checkVipStatus() {
      try {
        this.isVip = this.demoUserInfo.isVip;

        setTimeout(() => {
          if (!this.isVip) {
            this.showVipPopup = true;
          }
        }, 100);
      } catch (error) {
        console.error("VIP状态检查失败:", error);
        uni.showToast({
          title: "系统错误，请稍后再试",
          icon: "none",
        });
      }
    },
    handleBuyVip() {
      uni.showToast({
        title: "正在开发中...",
        icon: "none",
      });
      this.showVipPopup = false;
    },
    sendMessage() {
      if (!this.isVip) {
        setTimeout(() => {
          this.showVipPopup = true;
        }, 100);
        return;
      }

      if (!this.message.trim()) return;

      // 添加用户消息
      this.chatHistory.push({
        type: "user",
        content: this.message,
      });

      this.scrollToBottom();

      // 模拟AI回复，使用一些预设的回答
      setTimeout(() => {
        const aiResponses = [
          "这是一个很好的问题！让我来为你解答...",
          "根据我的理解，这个问题的关键在于...",
          "我建议你可以从以下几个方面来思考这个问题：\n1. 首先...\n2. 其次...\n3. 最后...",
          "这个问题比较复杂，我们可以一步步分析...",
          "让我用一个简单的例子来说明这个问题...",
        ];

        const randomResponse =
          aiResponses[Math.floor(Math.random() * aiResponses.length)];

        this.chatHistory.push({
          type: "ai",
          content: randomResponse,
        });
        this.scrollToBottom();
      }, 500);

      this.message = "";
    },
    scrollToBottom() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.scrollTop = this.scrollTop + 1000;
        }, 100);
      });
    },
    onPopupOpen() {
      console.log("弹窗打开");
    },
    onPopupClose() {
      console.log("弹窗关闭");
    },
  },
};
</script>

<style lang="scss">
.ai-tutor {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;

  .content {
    flex: 1;
    padding: 20rpx;
    position: relative;
    height: 100vh;
    box-sizing: border-box;

    .chat-container {
      background-color: #ffffff;
      border-radius: 12rpx;
      height: calc(100vh - 180rpx);
      padding: 20rpx;
      margin-bottom: 120rpx;
      box-sizing: border-box;

      .message-item {
        margin-bottom: 20rpx;
        padding: 10rpx;
        display: flex;
        align-items: flex-start;

        .avatar {
          width: 80rpx;
          height: 80rpx;
          flex-shrink: 0;

          image {
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }
        }

        .message-content {
          margin: 0 20rpx;
          display: inline-block;
          padding: 16rpx 24rpx;
          border-radius: 8rpx;
          max-width: calc(80% - 120rpx);
          word-break: break-all;
        }
      }

      .user-msg {
        flex-direction: row-reverse;

        .message-content {
          background-color: #4ecdb6;
          color: #ffffff;
        }
      }

      .ai-msg {
        flex-direction: row;

        .message-content {
          background-color: #f0f0f0;
          color: #333333;
        }
      }
    }

    .input-area {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #ffffff;
      padding: 20rpx;
      box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
    }
  }
}
</style>
