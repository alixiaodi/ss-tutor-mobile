<template>
  <view class="ai-tutor">
    <Navbar
      title="AI导师"
      bgColor="#4ECDB6"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></Navbar>

    <view class="chat-container">
      <view class="message-list">
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
          <!-- <text class="message-content">{{ item.content }}</text> -->
          <view
            class="message-content"
            v-if="item.status !== undefined && item.status === 1"
          >
            <MDParserHighlight :resource="item.content"></MDParserHighlight>
          </view>
          <text class="message-content" v-else>{{ item.content }}</text>
        </view>
      </view>
    </view>

    <view class="input-area">
      <view v-if="!isVip" class="chat-info">
        <text class="free-chat-count">
          今日剩余{{ freeChatNum }}次
          <text class="reset-time">({{ resetTimeText }})</text>
        </text>
      </view>

      <view class="input-wrapper">
        <u-input
          v-model="message"
          placeholder="请输入您的问题"
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
import MDParserHighlight from "../../components/cmder-MDParserHighlight/index.vue";
import Navbar from "@/components/navbar/Navbar";
import { mapState } from "vuex";
import VipPopup from "@/components/vip-popup/index.vue";
import * as userApi from "@/api/user.js";
import * as aiApi from "@/api/ai.js";

export default {
  components: {
    VipPopup,
    MDParserHighlight,
    Navbar,
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
        {
          type: "ai",
          content: "你好，我是你的AI导师，有什么我可以帮你的吗？",
        },
      ],
      scrollTop: 0,
      isVip: false,
      showVipPopup: false,
      freeChatNum: 0,
      resetTimeText: "",
      scrollAnimationDuration: 100,
      isScrolling: false,
    };
  },
  async onShow() {
    await this.getUserInfo();
    this.updateResetTime();
    this.resetTimeInterval = setInterval(() => {
      this.updateResetTime();
    }, 60000);
  },
  methods: {
    async getUserInfo() {
      try {
        const res = await userApi.getInfo();
        if (res.code === 200) {
          this.$store.commit("user/SET_USER_INFO", res.data);
          this.freeChatNum = res.data.freeChatNum || 0;
          const now = new Date().getTime();
          this.isVip = res.data.vipValid
            ? new Date(res.data.vipValid).getTime() > now
            : false;
        } else {
          throw new Error(res.message || "获取用户信息失败");
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
        uni.showToast({
          title: error.message || "获取用户信息失败",
          icon: "none",
        });
      }
    },
    async checkVipStatus() {
      try {
        if (!this.isVip) {
          setTimeout(() => {
            this.showVipPopup = true;
          }, 100);
        }
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
    async sendMessage() {
      if (!this.isVip && this.freeChatNum <= 0) {
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

      // 添加一个空的 AI 消息占位
      this.chatHistory.push({
        type: "ai",
        content: "",
      });

      this.scrollToBottom();

      try {
        const userMessage = this.message.trim();
        this.message = "";

        await aiApi.chat(userMessage, (newText) => {
          const lastMessage = this.chatHistory[this.chatHistory.length - 1];
          if (newText === "<|stop|>") {
            lastMessage.status = 1;
            this.$nextTick(() => {
              setTimeout(() => {
                this.isScrolling = false;
                this.scrollToBottom();
              }, 200);
            });
          } else {
            lastMessage.content += newText;
            if (!this.isScrolling) {
              this.scrollToBottom();
            }
          }
        });

        if (!this.isVip && this.freeChatNum > 0) {
          this.freeChatNum--;
        }
      } catch (error) {
        console.error("AI回复失败:", error);
        // 移除失败的 AI 消息
        this.chatHistory.pop();
        // 移除用户消息
        this.chatHistory.pop();

        uni.showToast({
          title: error.message || "获取回复失败，请重试",
          icon: "none",
        });
      }
    },
    scrollToBottom() {
      if (this.isScrolling) return;
      this.isScrolling = true;

      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this);
        query
          .select(".message-list")
          .boundingClientRect((data) => {
            uni.pageScrollTo({
              scrollTop: data.height + 2000,
              duration: 100,
              complete: () => {
                setTimeout(() => {
                  this.isScrolling = false;
                }, 150);
              },
            });
          })
          .exec();
      });
    },
    onPopupOpen() {
      console.log("弹窗打开");
    },
    onPopupClose() {
      console.log("弹窗关闭");
    },
    updateResetTime() {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const hours = Math.floor((tomorrow - now) / (1000 * 60 * 60));
      const minutes = Math.floor(((tomorrow - now) % (1000 * 60 * 60)) / (1000 * 60));

      this.resetTimeText = `${hours}小时${minutes}分钟后重置`;
    },
  },
  onHide() {
    if (this.resetTimeInterval) {
      clearInterval(this.resetTimeInterval);
    }
  },
  onUnload() {
    if (this.resetTimeInterval) {
      clearInterval(this.resetTimeInterval);
    }
  },
};
</script>

<style lang="scss">
.ai-tutor {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;

  .chat-container {
    flex: 1;
    padding: 20rpx;
    box-sizing: border-box;
    background-color: #f5f5f5;

    .message-list {
      padding-bottom: 120rpx;
    }

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
        background-color: #ffffff;
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

    .chat-info {
      padding-bottom: 10rpx;

      .free-chat-count {
        font-size: 24rpx;
        color: #666;

        .reset-time {
          color: #999;
          margin-left: 4rpx;
        }
      }
    }

    .input-wrapper {
      :deep(.u-input) {
        min-height: 80rpx;

        &__content {
          min-height: 80rpx;
          padding: 0 20rpx;
        }

        &__input {
          height: 80rpx;
          font-size: 28rpx;
        }
      }

      :deep(.u-button) {
        margin-left: 20rpx;
        margin-right: 10rpx;
        height: 64rpx;
        padding: 0 30rpx;
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
