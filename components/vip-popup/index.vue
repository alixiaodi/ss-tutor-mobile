<template>
  <u-popup
    v-model="show"
    mode="center"
    :show="show"
    borderRadius="10"
    @open="onPopupOpen"
    @close="onPopupClose"
  >
    <view class="vip-popup">
      <view class="popup-header">
        <text class="title">开通VIP</text>
        <u-icon name="close" size="20" @click="handleClose"></u-icon>
      </view>
      <view class="popup-content">
        <view class="vip-benefits">
          <view class="benefit-title">VIP特权</view>
          <view class="benefit-item">
            <u-icon name="checkmark-circle" color="#4ECDB6" size="16"></u-icon>
            <text>无限制使用AI导师</text>
          </view>
          <view class="benefit-item">
            <u-icon name="checkmark-circle" color="#4ECDB6" size="16"></u-icon>
            <text>无限制生成AI试卷</text>
          </view>
          <view class="benefit-item">
            <u-icon name="checkmark-circle" color="#4ECDB6" size="16"></u-icon>
            <text>无限制查看题目记忆方法</text>
          </view>
        </view>
        <view class="package-list">
          <view
            v-for="item in packageList"
            :key="item.id"
            class="package-item"
            :class="{ active: currentPackage && currentPackage.id === item.id }"
            @click="selectPackage(item)"
          >
            <text class="package-name">{{ item.name }}</text>
            <text class="package-price">￥{{ item.amount }}</text>
          </view>
        </view>
        <view class="price-section">
          <view class="price" v-if="currentPackage">
            <text class="symbol">￥</text>
            <text class="number">{{ currentPackage.amount }}</text>
            <text class="unit">/{{ formatUnit(currentPackage.expirUnit) }}</text>
          </view>
        </view>
      </view>
      <view class="popup-footer">
        <u-button type="primary" @click="handleBuyVip">购买</u-button>
      </view>
    </view>
  </u-popup>
</template>

<script>
import { vipPackageList } from "@/api/vipPackage.js";
import { createPayOrder } from "@/api/order.js";

export default {
  name: "VipPopup",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      packageList: [], // VIP套餐列表
      currentPackage: null, // 当前选中的套餐
    };
  },
  methods: {
    handleClose() {
      this.$emit("update:show", false);
      this.$emit("close");
    },
    async handleBuyVip() {
      if (!this.currentPackage) {
        uni.showToast({
          title: "请选择套餐",
          icon: "none",
        });
        return;
      }

      // 关闭弹窗
      this.handleClose();

      // 跳转到购买描述页面，并传递套餐信息
      uni.navigateTo({
        url: `/pages/vip/purchase/index?packageId=${this.currentPackage.id}&amount=${
          this.currentPackage.amount
        }&name=${encodeURIComponent(this.currentPackage.name)}`,
      });
    },
    onPopupOpen() {
      this.getVipPackages(); // 打开弹窗时获取套餐列表
      this.$emit("open");
    },
    onPopupClose() {
      this.$emit("close");
    },
    // 选择套餐
    selectPackage(pkg) {
      this.currentPackage = pkg;
    },
    // 格式化时间单位
    formatUnit(unit) {
      const unitMap = {
        0: "天",
        1: "月",
        2: "年",
      };
      return unitMap[unit] || "天";
    },
    // 获取VIP套餐列表
    async getVipPackages() {
      try {
        const res = await vipPackageList();
        if (res.code === 200) {
          this.packageList = res.data;
          // 默认选中第一个套餐
          if (this.packageList.length > 0) {
            this.currentPackage = this.packageList[0];
          }
        }
      } catch (error) {
        uni.showToast({
          title: "获取套餐列表失败",
          icon: "none",
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.vip-popup {
  width: 680rpx;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;

  .popup-header {
    padding: 40rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #4ecdb6, #39b9a0);

    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #ffffff;
    }

    .u-icon {
      color: #ffffff;
    }
  }

  .popup-content {
    padding: 40rpx;

    .vip-benefits {
      margin-top: 20rpx;

      .benefit-title {
        font-size: 32rpx;
        font-weight: bold;
        margin-bottom: 30rpx;
        color: #333;
      }

      .benefit-item {
        display: flex;
        align-items: center;
        margin-bottom: 24rpx;
        font-size: 28rpx;
        color: #666;

        .u-icon {
          margin-right: 16rpx;
        }
      }
    }

    .package-list {
      display: flex;
      justify-content: space-between;
      margin: 30rpx 0;
      gap: 20rpx;

      .package-item {
        flex: 1;
        padding: 30rpx 20rpx;
        text-align: center;
        border: 2rpx solid #eee;
        border-radius: 16rpx;
        transition: all 0.3s ease;

        &.active {
          border-color: #4ecdb6;
          background-color: rgba(78, 205, 182, 0.08);
          transform: translateY(-4rpx);
          box-shadow: 0 4rpx 12rpx rgba(78, 205, 182, 0.2);
        }

        .package-name {
          display: block;
          font-size: 30rpx;
          color: #333;
          margin-bottom: 16rpx;
        }

        .package-price {
          font-size: 36rpx;
          color: #ff6b6b;
          font-weight: bold;
        }
      }
    }

    .price-section {
      margin-top: 40rpx;
      text-align: center;

      .price {
        .symbol {
          font-size: 36rpx;
          color: #ff6b6b;
        }

        .number {
          font-size: 64rpx;
          font-weight: bold;
          color: #ff6b6b;
        }

        .unit {
          font-size: 26rpx;
          color: #999;
          margin-left: 8rpx;
        }
      }
    }
  }

  .popup-footer {
    padding: 30rpx 40rpx;
    border-top: 1px solid #f5f5f5;

    .u-button {
      background: linear-gradient(135deg, #4ecdb6, #39b9a0);
      border: none;
      height: 88rpx;
      border-radius: 44rpx;
      font-size: 32rpx;
      box-shadow: 0 4rpx 12rpx rgba(78, 205, 182, 0.3);
    }
  }
}

/deep/ .u-popup {
  border-radius: 24rpx;
  overflow: hidden;
}

/deep/ .u-popup__content {
  border-radius: 24rpx !important;
}
</style>
