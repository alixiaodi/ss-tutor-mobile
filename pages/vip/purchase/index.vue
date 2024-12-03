<template>
  <view class="purchase-container">
    <view class="header">
      <u-navbar
        title="会员购买指引"
        :autoBack="true"
        titleStyle="font-weight: 500;"
        fixed
        placeholder
      ></u-navbar>
    </view>

    <view class="steps-container">
      <view class="step-item">
        <view class="step-title">
          <text class="step-number">1</text>
          <text>复制店铺名称</text>
        </view>
        <view class="step-content">
          <view class="shop-name-box">
            <view class="content-wrapper">
              <view class="left-content">
                <view class="shop-info">
                  <view class="shop-label">淘宝店铺：</view>
                  <text class="shop-name text-center">{{ shopInfo.name }}</text>
                </view>
                <u-button size="mini" type="success" @click="copyShopName"
                  >点击复制店铺名称</u-button
                >
              </view>

              <view class="qrcode-box">
                <image
                  class="qrcode-image"
                  src="/static/img/dpmp.jpg"
                  mode="aspectFit"
                  @click="previewImage"
                ></image>
                <text class="qrcode-tip">扫描二维码直达店铺</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="step-item">
        <view class="step-title">
          <text class="step-number">2</text>
          <text>打开淘宝APP</text>
        </view>
        <view class="step-content">
          <text class="step-desc">请手动打开淘宝APP</text>
        </view>
      </view>

      <view class="step-item">
        <view class="step-title">
          <text class="step-number">3</text>
          <text>搜索店铺</text>
        </view>
        <view class="step-content">
          <text class="step-desc">点击淘宝搜索框，粘贴店铺名称进行搜索</text>
        </view>
      </view>

      <view class="step-item">
        <view class="step-title">
          <text class="step-number">4</text>
          <text>进入店铺购买</text>
        </view>
        <view class="step-content">
          <text class="step-desc">找到对应店铺后，可购买相关的VIP套餐</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      shopInfo: {
        name: "智慧编程坊",
      },
      qrcodeUrl: "/static/img/dpmp.jpg",
    };
  },

  methods: {
    copyShopName() {
      uni.setClipboardData({
        data: this.shopInfo.name,
        success: () => {
          uni.showToast({
            title: "店铺名称已复制",
            icon: "success",
          });
        },
      });
    },

    previewImage() {
      uni.previewImage({
        urls: [this.qrcodeUrl],
        current: this.qrcodeUrl,
        indicator: "number",
        loop: false,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.purchase-container {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding: 30rpx;
}

.steps-container {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  .step-item {
    margin-bottom: 50rpx;
    position: relative;

    &:last-child {
      margin-bottom: 0;
    }

    // 添加连接线
    &:not(:last-child)::after {
      content: "";
      position: absolute;
      left: 20rpx;
      top: 60rpx;
      width: 2rpx;
      height: calc(100% - 20rpx);
      background-color: #e8e8e8;
      z-index: 1;
    }

    .step-title {
      display: flex;
      align-items: center;
      margin-bottom: 24rpx;
      font-size: 32rpx;
      color: #333;
      font-weight: 600;

      .step-number {
        width: 40rpx;
        height: 40rpx;
        background: linear-gradient(135deg, #4ecdb6, #39b9a0);
        color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26rpx;
        margin-right: 20rpx;
        position: relative;
        z-index: 2;
        box-shadow: 0 4rpx 8rpx rgba(78, 205, 182, 0.2);
      }
    }

    .step-content {
      padding-left: 60rpx;
      min-height: 80rpx;

      .shop-name-box {
        background-color: #f8f8f8;
        padding: 30rpx;
        border-radius: 16rpx;

        .content-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .left-content {
            flex: 1;
            margin-right: 30rpx;

            .shop-info {
              text-align: left;
              margin-bottom: 30rpx;

              .shop-label {
                font-size: 28rpx;
                color: #666;
                margin-bottom: 12rpx;
              }

              .shop-name {
                font-size: 36rpx;
                color: #333;
                font-weight: 600;
                display: block;
                line-height: 1.4;
                margin-left: 20rpx;
                text-align: center;
                margin: 0 auto;
              }
            }

            .u-button {
              width: 100%;
              height: 70rpx;
              border-radius: 35rpx;
              font-size: 28rpx;
              box-shadow: 0 4rpx 8rpx rgba(78, 205, 182, 0.2);
              margin-top: 20rpx;

              &--success {
                background: linear-gradient(135deg, #4ecdb6, #39b9a0);
                border: none;
                font-weight: 500;
              }
            }
          }

          .qrcode-box {
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            align-items: center;

            .qrcode-image {
              width: 220rpx;
              height: 220rpx;
              border-radius: 12rpx;
              box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
              transition: opacity 0.2s ease;

              &:active {
                opacity: 0.8; // 点击时的视觉反馈
              }
            }

            .qrcode-tip {
              font-size: 24rpx;
              color: #666;
              margin-top: 12rpx;
            }
          }
        }
      }
    }
  }
}

.step-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}
</style>
