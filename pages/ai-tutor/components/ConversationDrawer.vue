<template>
  <view v-if="show" class="conversation-drawer">
    <view class="drawer-mask" @click="handleClose"></view>
    <view class="drawer-panel">
      <view class="drawer-header">
        <text>对话历史</text>
        <text class="close-btn" @click="handleClose">X</text>
      </view>
      <scroll-view scroll-y class="conversation-list">
        <view v-if="isLoading" class="conversation-loading">
          <text>加载中...</text>
        </view>
        <view v-else-if="!sortedConversations.length" class="conversation-empty">
          <text>暂无对话记录，点击下方按钮开始新的交流</text>
        </view>
        <view
          v-for="item in sortedConversations"
          :key="item.id"
          :class="['conversation-item', item.id === currentId ? 'active' : '']"
        >
          <view class="conversation-left" @click.stop="handleSelect(item)">
            <view class="conversation-title-row">
              <text class="conversation-title">
                {{ item.title || "未命名对话" }}
              </text>
              <text v-if="item.id === currentId" class="current-tag">当前</text>
              <view class="edit-title-btn" @click.stop="handleEditTitle(item)">
                <text class="edit-icon">编辑</text>
              </view>
            </view>
            <view class="conversation-preview">
              {{ getConversationPreview(item) }}
            </view>
          </view>
          <view class="conversation-right">
            <view class="conversation-info">
              <text class="conversation-time">
                {{ formatConversationTime(item.updatedAt) }}
              </text>
              <text class="conversation-count">
                {{ getConversationMessageCount(item) }}条
              </text>
            </view>
            <view class="delete-btn" @click.stop="handleDeleteClick(item)">
              <text>删除</text>
            </view>
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
    isLoading: {
      type: Boolean,
      default: false,
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
    handleDeleteClick(conversation) {
      uni.showModal({
        title: "确认删除",
        content: `确定要删除对话"${conversation.title || '未命名对话'}"吗？`,
        confirmText: "删除",
        confirmColor: "#ff4444",
        success: (res) => {
          if (res.confirm) {
            this.$emit("delete", conversation);
          }
        },
      });
    },
    handleEditTitle(conversation) {
      uni.showModal({
        title: "修改标题",
        editable: true,
        placeholderText: "请输入新标题",
        content: conversation.title || "",
        success: (res) => {
          if (res.confirm && res.content && res.content.trim()) {
            this.$emit("edit-title", conversation, res.content.trim());
          }
        },
      });
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
      if (!conversation) {
        return "暂无内容";
      }
      if (conversation.preview && conversation.preview.trim()) {
        return conversation.preview.trim();
      }
      if (Array.isArray(conversation.messages) && conversation.messages.length) {
        const reverseList = conversation.messages.slice().reverse();
        const targetMessage = reverseList.find(
          (msg) => msg && typeof msg.content === "string" && msg.content.trim()
        );
        if (targetMessage && targetMessage.content) {
          const text = targetMessage.content.trim().replace(/\s+/g, " ");
          return text.length > 30 ? `${text.slice(0, 30)}...` : text;
        }
      }
      return "暂无内容";
    },
    getConversationMessageCount(conversation) {
      if (!conversation) {
        return 0;
      }
      if (typeof conversation.messageCount === "number") {
        return conversation.messageCount;
      }
      if (Array.isArray(conversation.messages)) {
        return conversation.messages.length;
      }
      return 0;
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
            max-width: 320rpx;
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

          .edit-title-btn {
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            
            .edit-icon {
              font-size: 22rpx;
              color: #999;
              font-weight: 400;
              transition: color 0.2s ease;
            }
            
            &:active .edit-icon {
              color: #333;
            }
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
          justify-content: space-between;
          gap: 12rpx;

          .conversation-info {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            font-size: 24rpx;
            color: #999;
            gap: 6rpx;

            .conversation-time {
              font-size: 24rpx;
            }

            .conversation-count {
              font-size: 22rpx;
              color: #bbb;
            }
          }

          .delete-btn {
            padding: 6rpx 16rpx;
            background-color: rgba(255, 68, 68, 0.1);
            border: 1rpx solid rgba(255, 68, 68, 0.3);
            border-radius: 8rpx;
            font-size: 22rpx;
            color: #ff4444;

            &:active {
              background-color: rgba(255, 68, 68, 0.2);
            }
          }
        }
      }

      .conversation-empty {
        padding: 60rpx 0;
        text-align: center;
        color: #999;
        font-size: 26rpx;
      }

      .conversation-loading {
        padding: 60rpx 0;
        text-align: center;
        color: #f48c42;
        font-size: 26rpx;
      }
    }

    .drawer-actions {
      margin-top: 16rpx;
    }
  }
}
</style>
