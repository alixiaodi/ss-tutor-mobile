<template>
  <view>
    <Navbar :hideBtn="true" bgColor="#f3f4f6"></Navbar>
    <view class="profile-top">
      <view class="user-info">
        <view class="info-content">
          <view class="user-info--name">
            {{ getUserName }}
            <text
              class="vip-tag"
              :class="{ 'vip-expired': !vipStatus.isVip }"
              @click="openVipPopup"
            >
              {{ vipStatus.text }}
            </text>
          </view>
          <text class="user-info--account">{{ getAccount }}</text>
        </view>
        <view class="avatar-wrapper">
          <u-avatar src="/static/img/avatar.png" size="120rpx"></u-avatar>
        </view>
      </view>
    </view>
    <view>
      <view class="profile-rule">
        <view class="score-section">
          <text class="score-value">{{ user.points || 0 }}</text>
          <text class="score-label">积分</text>
        </view>
        <view class="sign-section">
          <view class="sign-btn" @click="handleSignIn" v-if="!hasSignedToday">
            <text>签到 +10</text>
          </view>
          <view class="signed-tag" v-else>
            <text>已签到</text>
          </view>
        </view>
      </view>
    </view>
    <view style="padding: 40rpx; background-color: #fff">
      <u-grid :border="false" col="4">
        <u-grid-item @click="navigateTo('/pages/study/history')">
          <u-icon name="file-text" color="#2979ff" size="60rpx"></u-icon>
          <text class="btn-text">学习记录</text>
        </u-grid-item>
        <u-grid-item @click="navigateTo('/pages/exam/history')">
          <u-icon name="calendar" color="#2979ff" size="60rpx"></u-icon>
          <text class="btn-text">考试记录</text>
        </u-grid-item>
        <u-grid-item @click="navigateTo('/pages/wrong/index')">
          <u-icon name="bookmark" color="#2979ff" size="60rpx"></u-icon>
          <text class="btn-text">错题本</text>
        </u-grid-item>
        <u-grid-item @click="navigateTo('/pages/collect/index')">
          <u-icon name="star" color="#2979ff" size="60rpx"></u-icon>
          <text class="btn-text">我的收藏</text>
        </u-grid-item>
      </u-grid>
    </view>

    <view class="data-panel">
      <view class="panel-item">
        <text class="item-value">{{ studyDays }}</text>
        <text class="item-label">学习天数</text>
      </view>
      <view class="panel-item">
        <text class="item-value">{{ examCount }}</text>
        <text class="item-label">考试次数</text>
      </view>
      <view class="panel-item">
        <text class="item-value">{{ correctRate }}</text>
        <text class="item-label">正确率</text>
      </view>
    </view>

    <view style="padding: 40rpx; margin-top: 40rpx">
      <u-row gutter="16">
        <u-col span="4">
          <u-button
            icon="server-man"
            text="在线客服"
            plain
            @click="contactService"
          ></u-button>
        </u-col>
        <u-col span="4">
          <u-button icon="share" text="商务合作" plain @click="showBusiness"></u-button>
        </u-col>
        <u-col span="4">
          <u-button
            icon="reload"
            text="退出登录"
            type="error"
            @click="handleLogout"
          ></u-button>
        </u-col>
      </u-row>
    </view>

    <Password :show="resetPassword" @close="resetPassword = false"></Password>
    <VipPopup :show.sync="showVipPopup"></VipPopup>
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import Password from "./password.vue";
import * as UserApi from "@/api/user";
import { logout, sign } from "@/api/user.js";
import VipPopup from "@/components/vip-popup/index.vue";

export default {
  components: {
    Navbar,
    Password,
    VipPopup,
  },
  data() {
    return {
      user: {
        nickName: "",
        email: "",
        phonenumber: "",
        userName: "",
        dept: null,
        points: 0,
        vipValid: null,
      },
      studyDays: "--",
      examCount: "--",
      correctRate: "--",
      hasSignedToday: false,
      resetPassword: false,
      showVipPopup: false,
    };
  },
  computed: {
    getUserName() {
      return this.user.nickName || "普通用户";
    },
    getAccount() {
      return this.user.email || this.user.phonenumber || this.user.userName || "";
    },
    getDeptName() {
      return this.user.dept && this.user.dept.deptName
        ? this.user.dept.deptName
        : "未知部门";
    },
    vipStatus() {
      if (!this.user.vipValid) {
        return {
          isVip: false,
          text: "开通VIP",
          days: 0,
        };
      }

      const now = new Date();
      const vipEndDate = new Date(this.user.vipValid);

      if (vipEndDate < now) {
        return {
          isVip: false,
          text: "VIP已过期",
          days: 0,
        };
      }

      const diffTime = vipEndDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        isVip: true,
        text: `VIP剩余${diffDays}天`,
        days: diffDays,
      };
    },
  },
  created() {
    this.getInfo();
    this.getStudyStats();
  },
  methods: {
    async getInfo() {
      try {
        const res = await UserApi.getInfo();
        console.log("获取用户信息返回数据:", res);
        if (res.code === 200 && res.data) {
          this.user = {
            ...this.user,
            points: res.data.points || 0,
            vipValid: res.data.vipValid || null,
          };
          this.hasSignedToday = res.data.hasSigned === "1";
        }
      } catch (error) {
        console.error("获取用户信息失败", error);
      } finally {
        uni.stopPullDownRefresh();
      }
    },
    navigateTo(url) {
      const developingFeatures = {
        "/pages/study/history": "学习记录功能正在开发中，敬请期待！",
        "/pages/exam/history": "考试记录统计功能即将上线，敬请期待！",
        "/pages/wrong/index": "错题本功能正在优化中，即将与您见面！",
        "/pages/collect/index": "收藏夹功能正在完善中，马上就来！",
      };

      if (developingFeatures[url]) {
        uni.showToast({
          title: developingFeatures[url],
          icon: "none",
          duration: 2000,
        });
        return;
      }

      uni.navigateTo({ url: url });
    },
    async handleLogout() {
      try {
        await logout();
        // 清除本地存储的用户信息和token
        uni.removeStorageSync("token");
        uni.removeStorageSync("userInfo");

        // 清除 vuex 中的用户信息
        this.$store.commit("SET_TOKEN", "");
        this.$store.commit("SET_USER", {});

        // 跳转到登录页面
        uni.reLaunch({
          url: "/pages/login/index",
        });
      } catch (error) {
        uni.$u.toast("退出登录失败");
      }
    },
    async handleSignIn() {
      if (this.hasSignedToday) return;

      try {
        const res = await sign();
        if (res.code === 200) {
          // 签到成功后立即更新用户信息
          await this.getInfo();

          uni.showToast({
            title: "签到成功 +10积分",
            icon: "none",
            duration: 2000,
          });
        } else {
          uni.showToast({
            title: res.msg || "签到失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("签到失败:", error);
        uni.showToast({
          title: "签到失���，请稍后重试",
          icon: "none",
        });
      }
    },
    contactService() {
      uni.showModal({
        title: "联系客服",
        content: "工作时间：周一至周五 9:00-18:00\nQQ客服：1697383273",
        confirmText: "复制QQ",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: "1697383273",
              success: () => {
                uni.showToast({
                  title: "QQ号已复制",
                  icon: "none",
                });
              },
            });
          }
        },
      });
    },
    getStudyStats() {
      // 暂时注释掉模拟数据加载
      /*
      uni.showLoading({
        title: '加载中...'
      })

      setTimeout(() => {
        this.studyDays = 15
        this.examCount = 8
        this.correctRate = '85%'
        uni.hideLoading()
      }, 500)
      */
    },
    showBusiness() {
      uni.showModal({
        title: "商务合作",
        content:
          "【合作范围】\n" +
          "----------------------------------------\n" +
          "✦ 软件开发服务\n" +
          "   - 教育类小程序开发\n" +
          "   - APP定制开发\n" +
          "   - 网站建设与维护\n\n" +
          "✦ 课程内容合作\n" +
          "   - 优质课程资源引入\n" +
          "   - 行业专家授课合作\n\n" +
          "✦ 平台技术合作\n" +
          "   - 教育系统定制开发\n" +
          "   - 技术解决方案支持\n\n" +
          "✦ 品牌推广合作\n" +
          "   - 品牌联合推广\n" +
          "   - 活动策划与执行\n\n" +
          "✦ 校企定制服务\n" +
          "   - 企业培训方案\n" +
          "   - 校企人才对接\n\n" +
          "----------------------------------------\n" +
          "商务合作QQ：1697383273\n" +
          "工作时间：周一至周五 9:00-18:00\n" +
          "期待与您的深入合作！",
        confirmText: "复制QQ",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: "1697383273",
              success: () => {
                uni.showToast({
                  title: "QQ号已复制，欢迎洽谈合作",
                  icon: "none",
                  duration: 2500,
                });
              },
            });
          }
        },
      });
    },
    onPullDownRefresh() {
      // 重新获取数据
      this.getInfo();
      this.getStudyStats();
    },
    openVipPopup() {
      this.showVipPopup = true;
    },
  },
};
</script>

<style lang="scss">
.profile-top {
  background: linear-gradient(
    180deg,
    rgba(51, 177, 158, 0.15) 0%,
    rgba(51, 177, 158, 0.05) 100%
  );
  padding-top: 30rpx;
  position: relative;
  padding-bottom: 0;
}

.profile-rule {
  height: 110rpx;
  padding: 0 40rpx;
  background: linear-gradient(120deg, #38bea8 0%, #2da192 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 140rpx;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    right: -40rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 2rpx;
    height: 40rpx;
    background: rgba(255, 255, 255, 0.1);
  }

  .score-value {
    color: #ffd700;
    font-size: 52rpx;
    font-weight: bold;
    line-height: 1;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    background: linear-gradient(to bottom, #fff4b8, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .score-label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 24rpx;
    margin-top: 6rpx;
    text-align: center;
    width: 100%;
  }
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20rpx 40rpx 40rpx;
  max-width: 100%;

  .info-content {
    order: 2;
    margin-top: 24rpx;
    position: relative;
    z-index: 1;
  }

  .avatar-wrapper {
    order: 1;
    background: rgba(255, 255, 255, 0.95);
    padding: 24rpx;
    border-radius: 50%;
    box-shadow: 0 8rpx 24rpx rgba(51, 177, 158, 0.2), 0 2rpx 8rpx rgba(51, 177, 158, 0.1);
    position: relative;

    &::after {
      content: "";
      position: absolute;
      left: -8rpx;
      top: -8rpx;
      right: -8rpx;
      bottom: -8rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(51, 177, 158, 0.15);
      z-index: -1;
    }
  }

  &--name {
    font-size: 48rpx;
    font-weight: 600;
    margin-bottom: 12rpx;
    color: #2c2c2c;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 16rpx;
  }

  &--account {
    font-size: 26rpx;
    color: #606266;
    display: block;
    opacity: 0.85;
  }

  :deep(.u-avatar) {
    border: 6rpx solid #33b19e;
    padding: 4rpx;
    transition: transform 0.3s ease;

    &:active {
      transform: scale(0.98);
    }
  }
}

.sign-btn {
  background: rgba(255, 215, 0, 0.12);
  border: 1px solid rgba(255, 215, 0, 0.6);
  border-radius: 28rpx;
  padding: 10rpx 32rpx;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: 0.5s;
  }

  &:active::before {
    left: 100%;
  }

  text {
    color: #ffd700;
    font-size: 26rpx;
    font-weight: 500;
  }

  &:active {
    transform: scale(0.98);
    background: rgba(255, 215, 0, 0.2);
  }
}

.signed-tag {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 28rpx;
  padding: 10rpx 32rpx;
  backdrop-filter: blur(4px);

  text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 26rpx;
  }
}

:deep(.u-grid) {
  padding: 30rpx 0;
  background: linear-gradient(180deg, #fff 0%, #f8f9fa 100%);

  .u-grid-item {
    padding: 20rpx 0;
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.98);
    }
  }
}

.btn-text {
  font-size: 28rpx;
  color: #606266;
  margin-top: 16rpx;
  font-weight: 500;
}

:deep(.u-button) {
  &--plain {
    border-color: #2979ff;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
    }

    &.u-button--error {
      border-color: $u-error;
    }
  }
}

.data-panel {
  margin: 40rpx;
  padding: 30rpx;
  background: #fff;
  border-radius: 12rpx;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .panel-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .item-value {
      font-size: 40rpx;
      font-weight: bold;
      color: #2979ff;
      margin-bottom: 8rpx;
    }

    .item-label {
      font-size: 24rpx;
      color: #606266;
    }
  }
}

:deep(.u-grid) {
  background: #fff;
  border-radius: 12rpx;

  .u-grid-item {
    padding: 30rpx 0;

    &:active {
      background-color: #f5f6fa;
    }
  }
}

.logout-btn {
  margin: 30rpx;
  padding: 0 20rpx;
}

.vip-tag {
  background: linear-gradient(45deg, #ffd700, #ffa500);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #fff;
  display: inline-flex;
  align-items: center;
  height: 36rpx;
  transition: all 0.3s ease;

  &.vip-expired {
    background: linear-gradient(45deg, #909399, #606266);
  }

  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}
</style>
