<template>
  <view class="ai-tutor">
    <Navbar
      title="AI导师"
      bgColor="#f48c42"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></Navbar>

    <view class="conversation-toolbar">
      <view class="current-conversation">
        <text class="label">当前对话：</text>
        <text class="title">{{ currentConversationTitle }}</text>
      </view>
      <view class="history-btn" @click="openConversationDrawer">
        <view class="history-icon"></view>
        <text>对话管理</text>
      </view>
    </view>

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

    <ConversationDrawer
      :show="showConversationDrawer"
      :conversations="conversations"
      :current-id="currentConversationId"
      :is-loading="isLoadingConversations"
      @close="closeConversationDrawer"
      @select="handleSelectConversation"
      @create="startNewConversation"
      @delete="handleDeleteConversation"
      @edit-title="handleEditConversationTitle"
    />

    <vip-popup :show.sync="showVipPopup" @open="onPopupOpen" @close="onPopupClose" />
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import { mapState } from "vuex";
import VipPopup from "@/components/vip-popup/index.vue";
import * as userApi from "@/api/user.js";
import * as aiApi from "@/api/ai.js";
import * as conversationApi from "@/api/aiConversation.js";
import ChatMessageList from "./components/ChatMessageList.vue";
import ChatInputArea from "./components/ChatInputArea.vue";
import ConversationDrawer from "./components/ConversationDrawer.vue";

export default {
  components: {
    VipPopup,
    Navbar,
    ChatMessageList,
    ChatInputArea,
    ConversationDrawer,
  },
  computed: {
    ...mapState({
      userInfo: (state) => state.user.userInfo,
    }),
    currentConversation() {
      return (
        this.conversations.find(
          (item) => item.id === this.currentConversationId
        ) || null
      );
    },
    currentConversationTitle() {
      return (this.currentConversation && this.currentConversation.title) || "默认对话";
    },
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
      conversations: [],
      currentConversationId: "",
      showConversationDrawer: false,
      isRestoringConversation: false,
      chatHistoryUnwatch: null,
      isLoadingConversations: false,
    };
  },
  async onShow() {
    await this.getUserInfo();
    this.updateResetTime();
    this.resetTimeInterval = setInterval(() => {
      this.updateResetTime();
    }, 60000);
  },
  async onLoad(options) {
    this.questionId = options.questionId || "";
    const questionTitle = options.questionTitle ? decodeURIComponent(options.questionTitle) : "";
    
    await this.initializeConversations();
    
    // 如果从题目页面跳转过来，自动创建新对话
    if (this.questionId && questionTitle) {
      await this.createConversationForQuestion(questionTitle);
    }
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

        // 构建请求参数
        const params = {
          conversationId: this.currentConversationId
        };
        
        // 如果有 questionId，也传递
        if (this.questionId) {
          params.questionId = this.questionId;
        }

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
        }, params);

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
          const params = {
            conversationId: this.currentConversationId
          };
          
          // 如果有 questionId，也传递
          if (this.questionId) {
            params.questionId = this.questionId;
            params.type = "aq";
          }

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
    async initializeConversations() {
      this.isLoadingConversations = true;
      try {
        // 从后端获取对话列表
        const res = await conversationApi.listConversations();
        
        if (res.code === 200 && res.data && Array.isArray(res.data)) {
          // 转换后端数据格式
          this.conversations = res.data.map(item => ({
            id: item.conversationId || item.id,
            title: item.title || "未命名对话",
            messages: item.messages ? JSON.parse(item.messages) : this.getDefaultMessages(),
            updatedAt: new Date(item.updateTime).getTime(),
          }));

          if (this.conversations.length > 0) {
            // 加载最新的对话
            this.currentConversationId = this.conversations[0].id;
            await this.loadConversationDetail(this.conversations[0].id);
          } else {
            // 如果没有对话，创建第一个
            await this.createFirstConversation();
          }
        } else {
          throw new Error(res.message || "获取对话列表失败");
        }
      } catch (error) {
        console.error("初始化对话列表失败:", error);
        // 降级：尝试从本地存储读取
        await this.initializeFromLocalStorage();
      } finally {
        this.isLoadingConversations = false;
        this.setupChatHistoryWatcher();
      }
    },
    async initializeFromLocalStorage() {
      let stored = [];
      try {
        stored = uni.getStorageSync("aiTutorConversations") || [];
      } catch (error) {
        console.warn("读取本地对话历史失败", error);
      }

      if (!Array.isArray(stored) || !stored.length) {
        const firstConversation = this.createLocalConversation();
        this.conversations = [firstConversation];
        this.currentConversationId = firstConversation.id;
        this.replaceChatHistoryFromConversation(firstConversation);
      } else {
        this.conversations = stored;
        this.currentConversationId = stored[0].id;
        this.replaceChatHistoryFromConversation(stored[0]);
      }
    },
    async createFirstConversation() {
      try {
        const title = "对话1";
        const messages = this.getDefaultMessages();
        const res = await conversationApi.createConversation({
          title: title,
          messages: JSON.stringify(messages),
        });

        if (res.code === 200 && res.data) {
          const newConversation = {
            id: res.data.conversationId || res.data.id,
            title: res.data.title || title,
            messages: messages,
            updatedAt: new Date(res.data.updateTime).getTime(),
          };
          this.conversations = [newConversation];
          this.currentConversationId = newConversation.id;
          this.replaceChatHistoryFromConversation(newConversation);
        } else {
          throw new Error(res.message || "创建对话失败");
        }
      } catch (error) {
        console.error("创建首个对话失败:", error);
        // 降级：使用本地对话
        const firstConversation = this.createLocalConversation();
        this.conversations = [firstConversation];
        this.currentConversationId = firstConversation.id;
        this.replaceChatHistoryFromConversation(firstConversation);
      }
    },
    createLocalConversation(title) {
      const timestamp = Date.now();
      const defaultTitle = title || `对话${(this.conversations.length || 0) + 1}`;
      return {
        id: `conv_${timestamp}`,
        title: defaultTitle,
        messages: this.getDefaultMessages(),
        updatedAt: timestamp,
      };
    },
    createConversation(title) {
      const timestamp = Date.now();
      const defaultTitle = title || `对话${(this.conversations.length || 0) + 1}`;
      return {
        id: `conv_${timestamp}`,
        title: defaultTitle,
        messages: this.getDefaultMessages(),
        updatedAt: timestamp,
      };
    },
    getDefaultMessages() {
      return [
        {
          type: "ai",
          content: "你好，我是你的AI导师，有什么我可以帮你的吗？",
          status: 1,
        },
      ];
    },
    replaceChatHistoryFromConversation(conversation) {
      const messages =
        (conversation && conversation.messages && conversation.messages.length
          ? conversation.messages
          : this.getDefaultMessages());
      this.isRestoringConversation = true;
      this.chatHistory = this.cloneMessages(messages);
      this.$nextTick(() => {
        this.isRestoringConversation = false;
        this.scrollToBottom();
      });
    },
    cloneMessages(list) {
      return JSON.parse(JSON.stringify(list || []));
    },
    setupChatHistoryWatcher() {
      this.teardownChatHistoryWatcher();
      this.chatHistoryUnwatch = this.$watch(
        "chatHistory",
        () => {
          if (this.isRestoringConversation) return;
          this.syncChatHistoryToConversation();
        },
        { deep: true }
      );
    },
    teardownChatHistoryWatcher() {
      if (typeof this.chatHistoryUnwatch === "function") {
        this.chatHistoryUnwatch();
        this.chatHistoryUnwatch = null;
      }
    },
    syncChatHistoryToConversation() {
      const index = this.conversations.findIndex(
        (item) => item.id === this.currentConversationId
      );
      if (index === -1) return;

      const updatedConversation = {
        ...this.conversations[index],
        messages: this.cloneMessages(this.chatHistory),
        updatedAt: Date.now(),
      };

      const derivedTitle = this.deriveConversationTitle(
        updatedConversation.title,
        updatedConversation.messages
      );
      if (derivedTitle) {
        updatedConversation.title = derivedTitle;
      }

      // 只更新本地数据，不调用后端接口
      // 因为后端在 /ai/chat 接口中已经保存了对话记录
      this.$set(this.conversations, index, updatedConversation);
    },
    deriveConversationTitle(currentTitle, messages) {
      const title = currentTitle || "";
      const needUpdate =
        !title.trim() || /^对话\d+$/.test(title.trim());
      if (!needUpdate) return "";
      const firstUserMessage = (messages || []).find(
        (msg) => msg.type === "user" && msg.content && msg.content.trim()
      );
      if (!firstUserMessage) return "";
      return firstUserMessage.content.trim().slice(0, 20);
    },
    openConversationDrawer() {
      this.showConversationDrawer = true;
    },
    closeConversationDrawer() {
      this.showConversationDrawer = false;
    },
    async handleSelectConversation(conversation) {
      if (!conversation || conversation.id === this.currentConversationId) {
        this.closeConversationDrawer();
        return;
      }
      if (this.isReceivingReply) {
        uni.showToast({
          title: "正在回复中，请稍后再切换",
          icon: "none",
        });
        return;
      }
      this.currentConversationId = conversation.id;
      this.closeConversationDrawer();
      
      // 从后端获取对话详情
      await this.loadConversationDetail(conversation.id);
    },
    async startNewConversation() {
      if (this.isReceivingReply) {
        uni.showToast({
          title: "正在回复中，请稍后再试",
          icon: "none",
        });
        return;
      }

      uni.showLoading({ title: "创建中..." });
      
      try {
        const title = `对话${this.conversations.length + 1}`;
        const messages = this.getDefaultMessages();
        
        const res = await conversationApi.createConversation({
          title: title,
          messages: JSON.stringify(messages),
        });

        if (res.code === 200 && res.data) {
          const newConversation = {
            id: res.data.conversationId || res.data.id,
            title: res.data.title || title,
            messages: messages,
            updatedAt: new Date(res.data.updateTime || Date.now()).getTime(),
          };
          
          this.conversations = [newConversation, ...this.conversations];
          this.currentConversationId = newConversation.id;
          this.replaceChatHistoryFromConversation(newConversation);
          this.closeConversationDrawer();
          
          uni.hideLoading();
          uni.showToast({
            title: "创建成功",
            icon: "success",
          });
        } else {
          throw new Error(res.message || "创建对话失败");
        }
      } catch (error) {
        console.error("创建新对话失败:", error);
        uni.hideLoading();
        uni.showToast({
          title: error.message || "创建失败，请重试",
          icon: "none",
        });
      }
    },
    async handleDeleteConversation(conversation) {
      if (this.isReceivingReply) {
        uni.showToast({
          title: "正在回复中，请稍后再试",
          icon: "none",
        });
        return;
      }

      // 如果只有一个对话，不允许删除
      if (this.conversations.length <= 1) {
        uni.showToast({
          title: "至少保留一个对话",
          icon: "none",
        });
        return;
      }

      uni.showLoading({ title: "删除中..." });

      try {
        // 如果不是本地ID，调用后端删除
        if (!conversation.id.toString().startsWith("conv_")) {
          const res = await conversationApi.deleteConversation(conversation.id);
          
          if (res.code !== 200) {
            throw new Error(res.message || "删除对话失败");
          }
        }

        // 从列表中移除
        const index = this.conversations.findIndex(
          (item) => item.id === conversation.id
        );
        
        if (index !== -1) {
          this.conversations.splice(index, 1);
          
          // 如果删除的是当前对话，切换到第一个对话
          if (conversation.id === this.currentConversationId) {
            if (this.conversations.length > 0) {
              this.currentConversationId = this.conversations[0].id;
              await this.loadConversationDetail(this.conversations[0].id);
            }
          }
        }

        uni.hideLoading();
        uni.showToast({
          title: "删除成功",
          icon: "success",
        });
      } catch (error) {
        console.error("删除对话失败:", error);
        uni.hideLoading();
        uni.showToast({
          title: error.message || "删除失败，请重试",
          icon: "none",
        });
      }
    },
    async handleEditConversationTitle(conversation, newTitle) {
      if (!newTitle || !newTitle.trim()) {
        return;
      }

      uni.showLoading({ title: "修改中..." });

      try {
        // 如果不是本地ID，调用后端更新
        if (!conversation.id.toString().startsWith("conv_")) {
          const res = await conversationApi.updateConversation(conversation.id, {
            conversationId: conversation.id,
            title: newTitle,
            messages: JSON.stringify(conversation.messages),
          });

          if (res.code !== 200) {
            throw new Error(res.message || "修改标题失败");
          }
        }

        // 更新本地数据
        const index = this.conversations.findIndex(
          (item) => item.id === conversation.id
        );

        if (index !== -1) {
          this.$set(this.conversations[index], "title", newTitle);
          this.$set(this.conversations[index], "updatedAt", Date.now());
        }

        uni.hideLoading();
        uni.showToast({
          title: "修改成功",
          icon: "success",
        });
      } catch (error) {
        console.error("修改标题失败:", error);
        uni.hideLoading();
        uni.showToast({
          title: error.message || "修改失败，请重试",
          icon: "none",
        });
      }
    },
    async loadConversationDetail(conversationId) {
      // 如果是本地ID，直接从本地数据加载
      if (conversationId.toString().startsWith("conv_")) {
        const conversation = this.conversations.find(
          (item) => item.id === conversationId
        );
        if (conversation) {
          this.replaceChatHistoryFromConversation(conversation);
        }
        return;
      }

      try {
        uni.showLoading({ title: "加载中..." });
        
        const res = await conversationApi.getConversationDetail(conversationId);
        
        if (res.code === 200 && res.data) {
          // 转换并更新对话数据
          const detailData = {
            id: res.data.conversationId || res.data.id,
            title: res.data.title || "未命名对话",
            messages: res.data.messages ? JSON.parse(res.data.messages) : this.getDefaultMessages(),
            updatedAt: new Date(res.data.updateTime).getTime(),
          };

          // 更新本地对话列表中的数据
          const index = this.conversations.findIndex(
            (item) => item.id === conversationId
          );
          if (index !== -1) {
            this.$set(this.conversations, index, detailData);
          }

          // 加载到聊天界面
          this.replaceChatHistoryFromConversation(detailData);
          
          uni.hideLoading();
        } else {
          throw new Error(res.message || "加载对话详情失败");
        }
      } catch (error) {
        console.error("加载对话详情失败:", error);
        uni.hideLoading();
        
        // 降级：使用本地数据
        const conversation = this.conversations.find(
          (item) => item.id === conversationId
        );
        if (conversation) {
          this.replaceChatHistoryFromConversation(conversation);
        } else {
          uni.showToast({
            title: "加载失败，请重试",
            icon: "none",
          });
        }
      }
    },
    async createConversationForQuestion(questionTitle) {
      try {
        // 使用题目内容前20个字符作为对话标题
        const title = questionTitle || "题目对话";
        const messages = this.getDefaultMessages();
        
        const res = await conversationApi.createConversation({
          title: title,
          messages: JSON.stringify(messages),
        });

        if (res.code === 200 && res.data) {
          const newConversation = {
            id: res.data.conversationId || res.data.id,
            title: res.data.title || title,
            messages: messages,
            updatedAt: new Date(res.data.updateTime || Date.now()).getTime(),
          };
          
          // 将新对话添加到列表顶部
          this.conversations = [newConversation, ...this.conversations];
          this.currentConversationId = newConversation.id;
          this.replaceChatHistoryFromConversation(newConversation);
          
          console.log("自动创建题目对话成功:", title);
        } else {
          throw new Error(res.message || "创建对话失败");
        }
      } catch (error) {
        console.error("自动创建题目对话失败:", error);
        // 静默失败，使用默认对话
      }
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
    this.teardownChatHistoryWatcher();
  },
};
</script>

<style lang="scss">
.ai-tutor {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;

  .conversation-toolbar {
    padding: 12rpx 24rpx;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);

    .current-conversation {
      display: flex;
      align-items: center;
      font-size: 26rpx;

      .label {
        color: #999;
        margin-right: 8rpx;
      }

      .title {
        color: #333;
        font-weight: 500;
        max-width: 420rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .history-btn {
      font-size: 26rpx;
      color: #f48c42;
      padding: 8rpx 20rpx;
      border: 1rpx solid rgba(244, 140, 66, 0.35);
      border-radius: 24rpx;
      display: flex;
      align-items: center;
      gap: 10rpx;
      background-color: rgba(244, 140, 66, 0.08);

      .history-icon {
        width: 24rpx;
        height: 24rpx;
        border-radius: 50%;
        border: 2rpx solid currentColor;
        position: relative;

        &:after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 12rpx;
          height: 2rpx;
          background-color: currentColor;
          transform: translate(-50%, -50%);
        }
      }
    }
  }

  .chat-wrapper {
    flex: 1;
    display: flex;
  }
}
</style>
