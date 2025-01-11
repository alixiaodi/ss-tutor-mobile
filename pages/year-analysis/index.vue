<template>
  <view class="analysis-container">
    <Navbar
      title="历年真题分析"
      bgColor="#4ECDB6"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></Navbar>

    <view class="content">
      <!-- 统计分析入口 -->
      <view class="analysis-entry" @click="goToAnalysis">
        <view class="entry-left">
          <u-icon name="list-dot" size="32" color="#4ECDB6"></u-icon>
          <text>考点统计</text>
        </view>
        <u-icon name="arrow-right" color="#999" size="28"></u-icon>
      </view>

      <view class="paper-list">
        <view v-if="needVip" class="empty-tip">
          <u-icon name="file-text" size="80" color="#c0c4cc" class="empty-icon"></u-icon>
          <view class="vip-btn" @click="showVipPopup = true">
            <u-icon name="VIP" size="32" color="#FFB800" class="vip-icon"></u-icon>
            <text>开通VIP查看更多</text>
          </view>
        </view>

        <view v-else-if="paperList.length === 0" class="empty-tip">
          <u-icon name="file-text" size="80" color="#c0c4cc" class="empty-icon"></u-icon>
          <text>暂无试卷分析</text>
        </view>

        <view
          class="paper-item"
          v-else
          v-for="(item, index) in paperList"
          :key="index"
          @click="handlePaperClick(item)"
        >
          <view class="paper-info">
            <text class="paper-name">{{ item.testPaperName }}</text>
            <text class="paper-year">分析时间：{{ item.createTime.split("T")[0] }}</text>
          </view>
          <u-icon name="arrow-right" color="#999" size="28"></u-icon>
        </view>
      </view>
    </view>

    <vip-popup :show="showVipPopup" @update:show="showVipPopup = $event"></vip-popup>
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import VipPopup from "@/components/vip-popup/index.vue";
import * as AnalysisApi from "@/api/testPaper/analysis";

export default {
  components: {
    Navbar,
    VipPopup,
  },
  data() {
    return {
      subjectCode: "",
      paperList: [],
      showVipPopup: false,
      needVip: false,
    };
  },
  onLoad(options) {
    if (options.subjectCode) {
      this.subjectCode = options.subjectCode;
      this.loadPaperList(); // 加载该学科的试卷列表
    }
  },
  methods: {
    async loadPaperList() {
      try {
        const res = await AnalysisApi.getPaperAnalysis(this.subjectCode);
        if (res.msg === 204) {
          this.showVipPopup = true;
          this.paperList = [];
          this.needVip = true;
          return;
        }
        this.paperList = res.data || [];
        this.needVip = false;
      } catch (error) {
        this.paperList = [];
        this.needVip = false;
        uni.showToast({
          title: "获取试卷列表失败",
          icon: "none",
        });
      }
    },
    handlePaperClick(item) {
      uni.navigateTo({
        url: `/pages/year-analysis/detail?id=${item.id}`,
      });
    },
    goToAnalysis() {
      uni.navigateTo({
        url: `/pages/year-analysis/statistics?subjectCode=${this.subjectCode}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.analysis-container {
  min-height: 100vh;
  background-color: #f5f6fa;

  .content {
    padding: 20px 15px;
  }

  .analysis-entry {
    background-color: #fff;
    border-radius: 12px;
    padding: 30rpx;
    margin-bottom: 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .entry-left {
      display: flex;
      align-items: center;
      gap: 20rpx;

      text {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
      }
    }

    &:active {
      background-color: #f9f9f9;
    }
  }

  .paper-list {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }

  .paper-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 16px;
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.3s;

    &:active {
      background-color: #f9f9f9;
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .paper-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .paper-name {
    font-size: 16px;
    color: #333;
    font-weight: 500;
    line-height: 1.4;
  }

  .paper-year {
    font-size: 13px;
    color: #999;
    line-height: 1.2;
  }

  .vip-text {
    margin-top: 20rpx;
    color: #4ecdb6;
    font-size: 28rpx;
    font-weight: 500;

    &:active {
      opacity: 0.8;
    }
  }

  .empty-tip {
    height: 70vh;
    padding: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .empty-icon {
      margin-bottom: 40rpx;
    }

    .vip-btn {
      height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 48rpx;
      background: linear-gradient(90deg, #4ecdb6 0%, #44b6a1 100%);
      border-radius: 44rpx;
      box-shadow: 0 8rpx 16rpx rgba(78, 205, 182, 0.2);
      color: #ffffff;
      font-size: 32rpx;
      font-weight: 600;
      letter-spacing: 1px;

      .vip-icon {
        margin-right: 12rpx;
      }

      text {
        line-height: 88rpx;
      }
    }
  }
}
</style>
