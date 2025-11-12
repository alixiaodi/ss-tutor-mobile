<template>
  <view class="ai-tutor">
    <Navbar
      title="AI导师"
      bgColor="#f48c42"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></Navbar>

    <view class="chat-wrapper">
      <ChatMessageList
        ref="messageList"
        :chat-history="chatHistory"
        :bottom-padding="inputAreaHeight + 20"
        @manual-scroll="handleManualScroll"
      />
    </view>

    <ChatInputArea
      v-model="message"
      :is-vip="isVip"
      :free-chat-num="freeChatNum"
      :reset-time-text="resetTimeText"
      :question-id="questionId"
      @send="sendMessage"
      @show-templates="showTemplates"
      @height-change="updateInputAreaHeight"
    />

    <view class="debug-info" style="display: none">
      <text>VIP状态: {{ isVip }}</text>
      <text>弹窗状态: {{ showVipPopup }}</text>
    </view>

    <vip-popup :show.sync="showVipPopup" @open="onPopupOpen" @close="onPopupClose" />
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import { mapState } from "vuex";
import VipPopup from "@/components/vip-popup/index.vue";
import * as userApi from "@/api/user.js";
import * as aiApi from "@/api/ai.js";
import ChatMessageList from "./components/ChatMessageList.vue";
import ChatInputArea from "./components/ChatInputArea.vue";

export default {
  components: {
    VipPopup,
    Navbar,
    ChatMessageList,
    ChatInputArea,
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
          status: 1,
        },
      ],
      scrollTop: 0,
      isVip: false,
      showVipPopup: false,
      freeChatNum: 0,
      resetTimeText: "",
      scrollAnimationDuration: 100,
      isScrolling: false,
      manualScrollInterrupted: false,
      isReceivingReply: false,
      templates: ["请解释一下这个题目"],
      showTemplatePopup: false,
      questionId: "",
      inputAreaHeight: 0,
    };
  },
  async onShow() {
    await this.getUserInfo();
    this.updateResetTime();
    this.resetTimeInterval = setInterval(() => {
      this.updateResetTime();
    }, 60000);
  },
  onLoad(options) {
    this.questionId = options.questionId || "";
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
        status: 1,
      });

      // 添加一个空的 AI 消息占位
      this.chatHistory.push({
        type: "ai",
        content: "",
      });

      this.manualScrollInterrupted = false;
      this.isReceivingReply = true;
      this.scrollToBottom();

      try {
        const userMessage = this.message.trim();
        this.message = "";

        await aiApi.chat(userMessage, (newText) => {
          const lastMessage = this.chatHistory[this.chatHistory.length - 1];
          if (newText === "<|stop|>") {
            this.isReceivingReply = false;
            this.$set(lastMessage, "status", 1);
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
        this.isReceivingReply = false;
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
    handleManualScroll() {
      if (this.manualScrollInterrupted) return;
      if (!this.isReceivingReply && !this.isScrolling) return;
      this.manualScrollInterrupted = true;
      this.isScrolling = false;
    },
    scrollToBottom() {
      if (this.manualScrollInterrupted || this.isScrolling) return;
      this.isScrolling = true;

      this.$nextTick(() => {
        const messageList = this.$refs.messageList;
        if (!messageList || typeof messageList.scrollToBottom !== "function") {
          this.isScrolling = false;
          return;
        }
        messageList.scrollToBottom().finally(() => {
          setTimeout(() => {
            this.isScrolling = false;
          }, 150);
        });
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
    showTemplates() {
      uni.showActionSheet({
        itemList: this.templates,
        success: (res) => {
          const selectedTemplate = this.templates[res.tapIndex];
          this.chatHistory.push({
            type: "user",
            content: selectedTemplate,
            status: 1,
          });

          this.chatHistory.push({
            type: "ai",
            content: "",
          });

          this.manualScrollInterrupted = false;
          this.isReceivingReply = true;
          this.scrollToBottom();

          // 构建请求参数
          const params = this.questionId
            ? { questionId: this.questionId, type: "aq" }
            : {};

          aiApi
            .chat(
              selectedTemplate,
              (newText) => {
                const lastMessage = this.chatHistory[this.chatHistory.length - 1];
                if (newText === "<|stop|>") {
                  this.isReceivingReply = false;
                  this.$set(lastMessage, "status", 1);
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
              },
              params
            ) // 传入参数
            .catch((error) => {
              console.error("AI回复失败:", error);
              this.isReceivingReply = false;
              this.chatHistory.pop();
              this.chatHistory.pop();

              uni.showToast({
                title: error.message || "获取回复失败，请重试",
                icon: "none",
              });
            });

          if (!this.isVip && this.freeChatNum > 0) {
            this.freeChatNum--;
          }
        },
      });
    },
    updateInputAreaHeight(height = 0) {
      this.inputAreaHeight = height;
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

  .chat-wrapper {
    flex: 1;
    display: flex;
  }
}
</style>
