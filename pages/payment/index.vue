<template>
  <view class="payment-container">
    <view class="header">
      <u-navbar
        title="支付"
        :autoBack="true"
        titleStyle="font-weight: 500;"
        fixed
        placeholder
      ></u-navbar>
    </view>

    <view class="payment-header">
      <view class="amount">
        <text class="currency">￥</text>
        <text class="number">{{ price }}</text>
      </view>
      <text class="desc">请保存二维码后使用微信扫码支付</text>
    </view>

    <view class="payment-content">
      <view class="qr-container">
        <image
          v-if="payUrl"
          class="qr-code"
          :src="qrCodeUrl"
          @longpress="saveQrCode"
          show-menu-by-longpress
        ></image>
        <view class="save-tips">
          <u-icon name="download" size="40" color="#4ecdb6"></u-icon>
          <text>长按或右键保存二维码</text>
        </view>
        <view class="steps">
          <view class="step-item">
            <text class="step-num">1</text>
            <text class="step-text">保存二维码到相册</text>
          </view>
          <view class="step-item">
            <text class="step-num">2</text>
            <text class="step-text">打开微信扫一扫</text>
          </view>
          <view class="step-item">
            <text class="step-num">3</text>
            <text class="step-text">从相册选择二维码</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      payUrl: "",
      price: "",
      qrCodeUrl: "",
    };
  },
  onLoad(options) {
    if (options.payUrl && options.price) {
      this.payUrl = decodeURIComponent(options.payUrl);
      this.price = options.price;
      this.generateQrCode();
    } else {
      uni.showToast({
        title: "支付参数错误",
        icon: "none",
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },
  methods: {
    generateQrCode() {
      uni.request({
        url: "https://api.qrserver.com/v1/create-qr-code/",
        method: "GET",
        data: {
          size: "200x200",
          data: this.payUrl,
        },
        responseType: "arraybuffer",
        success: (res) => {
          const base64 = uni.arrayBufferToBase64(res.data);
          this.qrCodeUrl = `data:image/png;base64,${base64}`;
        },
        fail: () => {
          uni.showToast({
            title: "二维码生成失败",
            icon: "none",
          });
        },
      });
    },
    saveQrCode() {
      uni.showLoading({
        title: "保存中...",
      });

      uni.downloadFile({
        url: this.qrCodeUrl,
        success: (res) => {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              uni.showToast({
                title: "二维码已保存到相册",
                icon: "success",
              });
            },
            fail: () => {
              uni.showToast({
                title: "保存失败，请检查权限",
                icon: "none",
              });
            },
          });
        },
        fail: () => {
          uni.showToast({
            title: "二维码保存失败",
            icon: "none",
          });
        },
        complete: () => {
          uni.hideLoading();
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.payment-container {
  min-height: 100vh;
  background-color: #ffffff;

  .payment-header {
    padding: 40rpx;
    text-align: center;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -20rpx;
      transform: translateX(-50%);
      width: 60rpx;
      height: 6rpx;
      background: #4ecdb6;
      border-radius: 3rpx;
    }

    .amount {
      margin-bottom: 20rpx;

      .currency {
        font-size: 40rpx;
        color: #333333;
        font-weight: 500;
      }

      .number {
        font-size: 60rpx;
        color: #333333;
        font-weight: bold;
      }
    }

    .desc {
      font-size: 28rpx;
      color: #666666;
    }
  }

  .payment-content {
    padding: 0 40rpx;

    .qr-container {
      background-color: #ffffff;
      border-radius: 24rpx;
      padding: 40rpx;
      text-align: center;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

      .qr-code {
        width: 400rpx;
        height: 400rpx;
        margin-bottom: 30rpx;
        border: 16rpx solid #f8f8f8;
        border-radius: 16rpx;
      }

      .save-tips {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 40rpx;
        background-color: #f8f8f8;
        padding: 16rpx 30rpx;
        border-radius: 30rpx;

        text {
          font-size: 28rpx;
          color: #666666;
          margin-left: 12rpx;
        }
      }

      .steps {
        border-top: 2rpx dashed #e8e8e8;
        padding-top: 30rpx;

        .step-item {
          display: flex;
          align-items: center;
          margin-bottom: 20rpx;
          padding: 16rpx;
          transition: all 0.3s;
          border-radius: 12rpx;

          &:hover {
            background-color: #f8f8f8;
          }

          .step-num {
            width: 40rpx;
            height: 40rpx;
            background: #4ecdb6;
            color: #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24rpx;
            margin-right: 20rpx;
            box-shadow: 0 4rpx 8rpx rgba(78, 205, 182, 0.2);
          }

          .step-text {
            font-size: 28rpx;
            color: #666666;
          }
        }
      }
    }
  }
}
</style>
