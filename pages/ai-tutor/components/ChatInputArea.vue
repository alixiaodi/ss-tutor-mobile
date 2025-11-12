<template>
  <view class="input-area">
    <view v-if="!isVip" class="chat-info">
      <text class="free-chat-count">
        今日剩余{{ freeChatNum }}次
        <text class="reset-time">({{ resetTimeText }})</text>
      </text>
    </view>

    <view class="input-wrapper">
      <view class="input-container">
        <u-input
          :value="value"
          placeholder="请输入您的问题"
          border="surround"
          :clearable="true"
          @input="handleInput"
        ></u-input>
        <view class="button-group">
          <u-button
            @click="$emit('send')"
            type="primary"
            size="mini"
            :disabled="!trimmedValue"
            >发送</u-button
          >
          <u-button
            v-if="questionId"
            @click="$emit('show-templates')"
            type="info"
            size="mini"
            icon="plus"
            class="template-btn"
          ></u-button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "ChatInputArea",
  props: {
    value: {
      type: String,
      default: "",
    },
    isVip: {
      type: Boolean,
      default: false,
    },
    freeChatNum: {
      type: Number,
      default: 0,
    },
    resetTimeText: {
      type: String,
      default: "",
    },
    questionId: {
      type: String,
      default: "",
    },
  },
  mounted() {
    this.reportHeight();
  },
  watch: {
    isVip() {
      this.reportHeight();
    },
    freeChatNum() {
      this.reportHeight();
    },
    resetTimeText() {
      this.reportHeight();
    },
  },
  computed: {
    trimmedValue() {
      return (this.value || "").trim();
    },
  },
  methods: {
    handleInput(value) {
      this.$emit("input", value);
    },
    reportHeight() {
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this);
        query
          .select(".input-area")
          .boundingClientRect((data) => {
            const height = (data && data.height) || 0;
            this.$emit("height-change", height);
          })
          .exec();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
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
    .input-container {
      display: flex;
      align-items: center;
      gap: 10rpx;

      :deep(.u-input) {
        flex: 1;
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

      .button-group {
        display: flex;
        align-items: center;
        gap: 10rpx;

        .u-button {
          height: 64rpx;
        }

        .template-btn {
          padding: 0;
          width: 64rpx;
        }
      }
    }
  }
}
</style>
