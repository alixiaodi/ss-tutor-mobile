<template>
  <view class="history-container">
    <!-- 顶部信息 -->
    <view class="paper-info">
      <view class="paper-title">{{ paperInfo.name || "试卷标题" }}</view>
      <view class="paper-meta">
        <text class="count">题目数量：{{ paperInfo.totalQuestions || 0 }}</text>
      </view>
    </view>

    <!-- 模式选择 -->
    <view class="mode-section">
      <view class="section-title">选择答题模式</view>
      <view class="mode-options">
        <view class="mode-item" @click="startExam('practice')">
          <u-icon name="edit-pen" size="32" color="#1890ff"></u-icon>
          <view class="mode-content">
            <text class="mode-name">练习模式</text>
            <text class="mode-desc">可查看答案解析，轻松学习</text>
          </view>
        </view>
        <view class="mode-item" @click="startExam('exam')">
          <u-icon name="clock" size="32" color="#52c41a"></u-icon>
          <view class="mode-content">
            <text class="mode-name">考试模式</text>
            <text class="mode-desc">模拟真实考试环境</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 答题历史 -->
    <view class="history-section">
      <view class="section-title">
        <text>答题历史</text>
        <text class="history-count">共{{ historyList.length }}次</text>
      </view>

      <view v-if="historyList.length === 0" class="empty-state">
        <u-empty
          mode="data"
          icon="/static/img/empty-data.png"
          text="暂无答题记录"
        ></u-empty>
      </view>

      <scroll-view v-else scroll-y class="history-list" @scrolltolower="loadMoreHistory">
        <view
          v-for="(item, index) in historyList"
          :key="index"
          class="history-item"
          @click="viewHistoryDetail(item)"
        >
          <view class="history-info">
            <text class="history-mode" :class="item.mode">
              {{ item.mode === "practice" ? "练习" : "考试" }}
            </text>
            <text class="history-score">{{ item.score }}分</text>
            <text class="history-time">{{ item.date }}</text>
          </view>
          <view class="history-stats">
            <text class="stat-item">
              <text class="label">正确</text>
              <text class="value correct">{{ item.correct }}</text>
            </text>
            <text class="stat-item">
              <text class="label">错误</text>
              <text class="value wrong">{{ item.wrong }}</text>
            </text>
            <text class="stat-item">
              <text class="label">用时</text>
              <text class="value">{{ item.duration }}</text>
            </text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      paperId: "",
      paperInfo: {
        // TODO: 从API获取试卷信息
        name: "模拟试卷",
        totalQuestions: 100,
        createTime: "2024-03-20",
      },
      historyList: [
        // TODO: 从API获取历史记录
        {
          id: 1,
          mode: "practice",
          score: 90,
          date: "2024-03-20 14:30",
          correct: 45,
          wrong: 5,
          duration: "45分钟",
        },
        {
          id: 2,
          mode: "exam",
          score: 85,
          date: "2024-03-19 10:20",
          correct: 42,
          wrong: 8,
          duration: "60分钟",
        },
      ],
      page: 1,
      hasMore: true,
    };
  },

  onLoad(options) {
    if (options.id) {
      this.paperId = options.id;
      // TODO: 获取试卷信息和历史记录
    } else {
      uni.navigateBack();
    }
  },

  methods: {
    loadMoreHistory() {
      // TODO: 实现加载更多历史记录
      console.log("加载更多历史记录");
    },

    startExam(mode) {
      uni.navigateTo({
        url: `/pages/past-papers/exam?id=${this.paperId}&mode=${mode}`,
      });
    },

    viewHistoryDetail(history) {
      uni.navigateTo({
        url: `/pages/past-papers/review?id=${history.id}`,
      });
    },
  },
};
</script>

<style scoped>
.history-container {
  min-height: 100vh;
  background-color: #f5f6fa;
  padding: 30rpx;
}

.paper-info {
  background: #fff;
  padding: 30rpx;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
}

.paper-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.paper-meta {
  display: flex;
  align-items: center;
  gap: 20rpx;
  font-size: 26rpx;
  color: #999;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mode-section {
  background: #fff;
  padding: 30rpx;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
}

.mode-options {
  display: flex;
  gap: 20rpx;
}

.mode-item {
  flex: 1;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.mode-item:active {
  background: #f0f0f0;
}

.mode-content {
  flex: 1;
}

.mode-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.mode-desc {
  font-size: 24rpx;
  color: #999;
}

.history-section {
  background: #fff;
  padding: 30rpx;
  border-radius: 12rpx;
}

.history-count {
  font-size: 26rpx;
  color: #999;
  font-weight: normal;
}

.history-list {
  max-height: 800rpx;
}

.history-item {
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}

.history-item:active {
  background: #f0f0f0;
}

.history-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.history-mode {
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-size: 24rpx;
}

.history-mode.practice {
  background: #e6f7ff;
  color: #1890ff;
}

.history-mode.exam {
  background: #f6ffed;
  color: #52c41a;
}

.history-score {
  font-size: 28rpx;
  font-weight: 500;
  color: #52c41a;
}

.history-time {
  font-size: 24rpx;
  color: #999;
  margin-left: auto;
}

.history-stats {
  display: flex;
  gap: 40rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.label {
  font-size: 24rpx;
  color: #999;
}

.value {
  font-size: 26rpx;
  color: #333;
}

.value.correct {
  color: #52c41a;
}

.value.wrong {
  color: #ff4d4f;
}

.empty-state {
  padding: 60rpx 0;
}
</style>
