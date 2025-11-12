<template>
  <view class="chat-container">
    <view
      class="message-list"
      :style="{ '--chat-bottom-padding': bottomPadding + 'px' }"
      @touchstart="handleManualScroll"
      @touchmove="handleManualScroll"
    >
      <view
        v-for="(item, index) in chatHistory"
        :key="index"
        :class="['message-item', item.type === 'user' ? 'user-msg' : 'ai-msg']"
      >
        <view class="avatar">
          <image
            :src="item.type === 'user' ? '/static/img/stu-avatar.png' : '/static/img/ai.png'"
            mode="aspectFill"
          />
        </view>
        <view class="message-content">
          <view class="light">
            <f-md :content="item.content" :isStreaming="item.status !== 1"></f-md>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import fMd from "@/components/f-md/f-md.vue";

export default {
  name: "ChatMessageList",
  components: { fMd },
  props: {
    chatHistory: {
      type: Array,
      default: () => [],
    },
    bottomPadding: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    handleManualScroll() {
      this.$emit("manual-scroll");
    },
    scrollToBottom() {
      return new Promise((resolve) => {
        this.$nextTick(() => {
          const query = uni.createSelectorQuery().in(this);
          query
            .select(".message-list")
            .boundingClientRect((data) => {
              const height = (data && data.height) || 0;
              if (uni && typeof uni.pageScrollTo === "function") {
                uni.pageScrollTo({
                  scrollTop: height + 2000,
                  duration: 100,
                  complete: resolve,
                  fail: resolve,
                });
              } else {
                resolve();
              }
            })
            .exec();
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.chat-container {
  flex: 1;
  padding: 20rpx;
  box-sizing: border-box;
  background-color: #f5f5f5;

  .message-list {
    padding-bottom: var(--chat-bottom-padding, 140rpx);
    padding-bottom: calc(var(--chat-bottom-padding, 140rpx) + env(safe-area-inset-bottom));
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
      display: flex;
      flex-direction: column;
      padding: 16rpx 24rpx;
      border-radius: 8rpx;
      flex: 1;
      max-width: calc(100% - 120rpx);
      word-break: break-word;
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
</style>
