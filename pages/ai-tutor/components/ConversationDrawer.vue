<template>
  <view v-if="show" class="conversation-drawer">
    <view class="drawer-mask" @click="handleClose"></view>
    <view class="drawer-panel">
      <view class="drawer-header">
        <text>对话历史</text>
        <text class="close-btn" @click="handleClose">X</text>
      </view>
      <scroll-view scroll-y class="conversation-list">
        <view v-if="!sortedConversations.length" class="conversation-empty">
          <text>暂无对话记录，点击下方按钮开始新的交流</text>
        </view>
        <view
          v-for="item in sortedConversations"
          :key="item.id"
          :class="['conversation-item', item.id === currentId ? 'active' : '']"
          @click="handleSelect(item)"
        >
          <view class="conversation-left">
            <view class="conversation-title-row">
              <text class="conversation-title">
                {{ item.title || "未命名对话" }}
              </text>
              <text v-if="item.id === currentId" class="current-tag">当前</text>
            </view>
            <view class="conversation-preview">
              {{ getConversationPreview(item) }}
            </view>
          </view>
          <view class="conversation-right">
            <text class="conversation-time">
              {{ formatConversationTime(item.updatedAt) }}
            </text>
            <text class="conversation-count">
              {{ getConversationMessageCount(item) }}条
            </text>
          </view>
        </view>
      </scroll-view>
      <view class="drawer-actions">
        <u-button type="primary" size="small" @click="handleCreate"
          >新建对话</u-button
        >
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "ConversationDrawer",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    conversations: {
      type: Array,
      default: () => [],
    },
    currentId: {
      type: String,
      default: "",
    },
  },
  computed: {
    sortedConversations() {
      const list = [...(this.conversations || [])];
      return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    },
  },
  methods: {
    handleClose() {
      this.$emit("close");
    },
    handleSelect(conversation) {
      this.$emit("select", conversation);
    },
    handleCreate() {
      this.$emit("create");
    },
    formatConversationTime(timestamp) {
      if (!timestamp) return "刚刚";
      const date = new Date(timestamp);
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${month}-${day} ${hours}:${minutes}`;
    },
    getConversationPreview(conversation) {
      if (!conversation || !Array.isArray(conversation.messages)) {
        return "暂无内容";
      }
      const reverseList = conversation.messages.slice().reverse();
      const targetMessage = reverseList.find(
        (msg) => msg && typeof msg.content === "string" && msg.content.trim()
      );
      if (!targetMessage) return "暂无内容";
      const text = targetMessage.content.trim().replace(/\s+/g, " ");
      return text.length > 30 ? `${text.slice(0, 30)}...` : text;
    },
    getConversationMessageCount(conversation) {
      if (!conversation || !Array.isArray(conversation.messages)) {
        return 0;
      }
      return conversation.messages.length;
    },
  },
};
</script>

<style lang="scss" scoped>
.conversation-drawer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;

  .drawer-mask {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .drawer-panel {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    border-top-left-radius: 24rpx;
    border-top-right-radius: 24rpx;
    padding: 24rpx;
    max-height: 80vh;
    display: flex;
    flex-direction: column;

    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 30rpx;
      font-weight: 500;
      margin-bottom: 16rpx;

      .close-btn {
        font-size: 40rpx;
        padding: 0 10rpx;
      }
    }

    .conversation-list {
      flex: 1;
      max-height: 60vh;
      padding-bottom: 20rpx;

      .conversation-item {
        padding: 20rpx;
        margin-bottom: 16rpx;
        border: 1rpx solid rgba(0, 0, 0, 0.05);
        border-radius: 20rpx;
        background-color: #fafafa;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.2s ease;

        &:last-child {
          margin-bottom: 0;
        }

        &.active {
          border-color: rgba(244, 140, 66, 0.5);
          background-color: rgba(244, 140, 66, 0.08);
          box-shadow: 0 6rpx 20rpx rgba(244, 140, 66, 0.15);
        }

        .conversation-left {
          flex: 1;
          padding-right: 20rpx;
          min-width: 0;

          .conversation-title-row {
            display: flex;
            align-items: center;
            gap: 12rpx;
            margin-bottom: 6rpx;
          }

          .conversation-title {
            font-size: 30rpx;
            color: #333;
            font-weight: 500;
            max-width: 400rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .current-tag {
            font-size: 20rpx;
            padding: 2rpx 10rpx;
            border-radius: 20rpx;
            background-color: rgba(244, 140, 66, 0.15);
            color: #f48c42;
          }

          .conversation-preview {
            font-size: 24rpx;
            color: #666;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .conversation-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 24rpx;
          color: #999;
          gap: 6rpx;

          .conversation-count {
            font-size: 22rpx;
            color: #bbb;
          }
        }
      }

      .conversation-empty {
        padding: 60rpx 0;
        text-align: center;
        color: #999;
        font-size: 26rpx;
      }
    }

    .drawer-actions {
      margin-top: 16rpx;
    }
  }
}
</style>
