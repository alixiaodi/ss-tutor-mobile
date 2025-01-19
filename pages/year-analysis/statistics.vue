<template>
  <view class="statistics-container">
    <Navbar
      title="考点统计"
      bgColor="#4ECDB6"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></Navbar>

    <view class="content">
      <!-- 考点列表 -->
      <view class="exam-point-list">
        <view class="list-header">
          <text class="header-item">考点</text>
          <text class="header-item">考试频率（次）</text>
        </view>
        <view class="list-content">
          <view
            class="list-item"
            v-for="(item, index) in examPointList"
            :key="index"
            @click="handleItemClick(item)"
          >
            <text class="point-name">{{ item.name }}</text>
            <view class="point-right">
              <text class="point-count">{{ item.count }}</text>
              <u-icon
                name="arrow-right"
                color="#999"
                size="14"
                class="arrow-icon"
              ></u-icon>
            </view>
          </view>
          <!-- 空状态 -->
          <view class="empty-state" v-if="examPointList.length === 0">
            <u-empty mode="data" text="暂无考点数据"></u-empty>
          </view>
        </view>
      </view>

      <!-- 添加VIP提示 -->
      <view v-if="needVip" class="vip-tip" @click="handleVipClick">
        <view class="vip-btn">
          <u-icon name="vip" size="32" color="#FFB800" class="vip-icon"></u-icon>
          <text>开通VIP查看更多</text>
        </view>
      </view>
    </view>

    <!-- 回到顶部按钮 -->
    <view class="back-to-top" v-show="showBackToTop" @click="scrollToTop">
      <u-icon name="arrow-up" color="#fff" size="20"></u-icon>
    </view>

    <vip-popup :show="showVipPopup" @update:show="showVipPopup = $event"></vip-popup>
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import * as AnalysisApi from "@/api/testPaper/analysis";
import VipPopup from "@/components/vip-popup/index.vue";

export default {
  components: {
    Navbar,
    VipPopup,
  },
  data() {
    return {
      subjectCode: "",
      examPointList: [], // 考点列表数据
      showBackToTop: false, // 是否显示回到顶部按钮
      needVip: false, // 是否需要VIP
      showVipPopup: false, // VIP弹窗控制
    };
  },
  onLoad(options) {
    if (options.subjectCode) {
      this.subjectCode = options.subjectCode;
      this.loadStatistics();
    }
  },
  onPageScroll(e) {
    // 控制回到顶部按钮的显示/隐藏
    this.showBackToTop = e.scrollTop > 200;
  },
  methods: {
    async loadStatistics() {
      try {
        const res = await AnalysisApi.getExamPointAnalysis(this.subjectCode);
        if (res.msg === 204) {
          this.needVip = true;
          // 如果有数据，只显示部分数据
          if (res.data && res.data.length > 0) {
            this.examPointList = res.data.slice(0, 3).map((item) => ({
              name: item.name,
              count: parseInt(item.value),
            }));
          }
          return;
        }
        if (res.data) {
          this.processExamPoints(res.data);
        }
      } catch (error) {
        uni.showToast({
          title: "获取统计数据失败",
          icon: "none",
        });
      }
    },
    processExamPoints(data) {
      // 处理考点数据
      this.examPointList = data
        .map((item) => ({
          name: item.name,
          count: parseInt(item.value),
        }))
        .sort((a, b) => b.count - a.count);
    },
    // 滚动到顶部
    scrollToTop() {
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 300,
      });
    },
    // 处理VIP点击
    handleVipClick() {
      this.showVipPopup = true;
    },
    // 处理列表项点击
    handleItemClick(item) {
      uni.showToast({
        title: "正在开发中",
        icon: "none",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.statistics-container {
  min-height: 100vh;
  background-color: #f5f6fa;

  .content {
    padding: 20px 15px;
  }

  .exam-point-list {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    overflow: hidden;

    .list-header {
      display: flex;
      justify-content: space-between;
      padding: 30rpx;
      background: #f8f9fa;
      border-bottom: 1px solid #eee;

      .header-item {
        font-size: 28rpx;
        color: #666;
        font-weight: 500;
      }
    }

    .list-content {
      .list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        &:active {
          background-color: #f9f9f9;
        }

        .point-name {
          flex: 1;
          font-size: 28rpx;
          color: #333;
        }

        .point-right {
          display: flex;
          align-items: center;

          .point-count {
            font-size: 28rpx;
            color: #4ecdb6;
            font-weight: 500;
            margin-right: 10rpx;
          }

          .arrow-icon {
            margin-left: 6rpx;
          }
        }
      }
    }

    .empty-state {
      padding: 60rpx 0;
    }
  }

  /* 回到顶部按钮样式 */
  .back-to-top {
    position: fixed;
    right: 20px;
    bottom: 120px;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #4ecdb6 0%, #44b6a1 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(78, 205, 182, 0.3);
    z-index: 99;
    transition: all 0.3s;

    &:active {
      transform: scale(0.95);
      opacity: 0.9;
    }
  }

  /* VIP提示样式 */
  .vip-tip {
    margin-top: 30rpx;
    padding: 0 30rpx;

    .vip-btn {
      height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(90deg, #4ecdb6 0%, #44b6a1 100%);
      border-radius: 44rpx;
      box-shadow: 0 8rpx 16rpx rgba(78, 205, 182, 0.2);

      .vip-icon {
        margin-right: 12rpx;
      }

      text {
        color: #ffffff;
        font-size: 32rpx;
        font-weight: 600;
        letter-spacing: 1px;
      }
    }
  }
}
</style>
