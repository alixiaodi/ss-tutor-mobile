<template>
  <view class="settings-container">
    <Navbar
      title="系统配置"
      bgColor="#4ECDB6"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></Navbar>

    <view class="settings-list">
      <view class="settings-group">
        <view class="group-title">基本设置</view>
        <u-cell-group>
          <u-cell
            title="答题提示音"
            @click="toggleSound"
            :value="soundEnabled ? '已开启' : '已关闭'"
            isLink
          >
            <template #icon>
              <u-icon
                slot="icon"
                name="volume"
                size="32rpx"
                :color="soundEnabled ? '#4ECDB6' : '#909399'"
              ></u-icon>
            </template>
          </u-cell>
        </u-cell-group>
      </view>
    </view>
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";

export default {
  components: {
    Navbar,
  },
  data() {
    return {
      soundEnabled: true,
    };
  },
  methods: {
    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      uni.showToast({
        title: this.soundEnabled ? "已开启答题提示音" : "已关闭答题提示音",
        icon: "none",
      });
      // 保存提示音设置到本地存储
      uni.setStorageSync("soundEnabled", this.soundEnabled);
    },
  },
  onLoad() {
    // 从本地存储获取提示音设置
    const soundEnabled = uni.getStorageSync("soundEnabled");
    if (soundEnabled !== "") {
      this.soundEnabled = soundEnabled;
    }
  },
};
</script>

<style lang="scss">
.settings-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;

  .settings-list {
    flex: 1;
    padding: 20rpx;
    box-sizing: border-box;
    background-color: #f5f5f5;
  }

  .settings-group {
    margin-bottom: 30rpx;
    background-color: #ffffff;
    border-radius: 12rpx;
    overflow: hidden;

    .group-title {
      font-size: 28rpx;
      color: #666666;
      padding: 20rpx 30rpx;
      background-color: #f8f8f8;
    }
  }

  :deep(.u-cell) {
    .u-icon {
      margin-right: 10rpx;
    }
  }
}
</style>
