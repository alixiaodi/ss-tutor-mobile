<template>
  <view class="history-container">
    <Navbar title="答题历史" bgColor="#fff" :hideBtn="false" :h5Show="true"></Navbar>

    <!-- 顶部信息 -->
    <view class="paper-info">
      <view class="paper-title">{{ paperInfo.name }}</view>
      <view class="paper-meta">
        <view class="basic-info">
          <text class="info-item">总题数：{{ paperInfo.totalQuestions }}题</text>
          <text class="info-item">总分：{{ paperInfo.totalScore }}分</text>
        </view>
        <view
          class="paper-types"
          v-if="paperInfo.paperTypes && paperInfo.paperTypes.length"
        >
          <text
            v-for="(type, index) in paperInfo.paperTypes"
            :key="index"
            class="type-item"
          >
            {{ type.type }}({{ type.num }}题/{{ type.score }}分)
          </text>
        </view>
      </view>
    </view>

    <!-- 模式选择 -->
    <view class="mode-section">
      <view class="section-title">选择答题模式</view>
      <view class="mode-options">
        <view class="mode-item" @click="startExam('0')">
          <u-icon name="edit-pen" size="32" color="#1890ff"></u-icon>
          <view class="mode-content">
            <text class="mode-name">练习模式</text>
            <text class="mode-desc">可查看答案解析，轻松学习</text>
          </view>
        </view>
        <view class="mode-item" @click="startExam('1')">
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

      <scroll-view
        v-else
        scroll-y
        class="history-list"
        @scrolltolower="loadMoreHistory"
        :refresher-enabled="true"
        :refresher-triggered="isRefreshing"
        @refresherrefresh="onRefresh"
      >
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
              <text class="label">用时</text>
              <text class="value">{{ item.duration }}</text>
            </text>
          </view>
        </view>

        <!-- 添加底部加载更多提示 -->
        <view class="load-more" v-if="historyList.length > 0">
          <text v-if="hasMore">加载中...</text>
          <text v-else>没有更多数据了</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import * as AnswerQuestionsApi from "@/api/answerQuestions";
import * as TestPaperApi from "@/api/testPaper";
export default {
  data() {
    return {
      paperId: "",
      paperInfo: {
        name: "模拟试卷",
        totalQuestions: 100,
        createTime: "2024-03-20",
      },
      historyList: [],
      page: 1,
      hasMore: true,
      isRefreshing: false,
      pageSize: 10, // 每页数量
      isFirstLoad: true,
    };
  },
  components: {
    Navbar,
  },
  onLoad(options) {
    if (options.id) {
      this.paperId = options.id;
      this.loadPaperDetail();
      this.refreshHistoryList();
    } else {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.options && currentPage.options.id) {
        this.paperId = currentPage.options.id;
        this.loadPaperDetail();
        this.refreshHistoryList();
      }
    }
  },

  onShow() {
    if (this.paperId && !this.isFirstLoad) {
      this.refreshHistoryList();
    }
    this.isFirstLoad = false;
  },

  methods: {
    loadMoreHistory() {
      if (!this.hasMore) return;
      this.page += 1;
      this.loadHistory();
    },

    startExam(mode) {
      if (mode === "1") {
        uni.showToast({
          title: "考试模式开发中",
          icon: "none",
          duration: 2000,
        });
        return;
      }

      AnswerQuestionsApi.add({
        paperId: this.paperId,
        type: mode,
      }).then((res) => {
        uni.navigateTo({
          url: `/pages/past-papers/exam?id=${this.paperId}&mode=${mode}&answerId=${res.data}`,
        });
      });
    },

    viewHistoryDetail(history) {
      uni.navigateTo({
        url: `/pages/past-papers/review?id=${history.id}`,
      });
    },

    loadHistory(isRefresh = false) {
      if (isRefresh) {
        this.page = 1;
        this.hasMore = true;
      }

      AnswerQuestionsApi.getHistory(this.paperId, {
        page: this.page,
        pageSize: this.pageSize,
      })
        .then((res) => {
          const formattedData = res.data.map((item) => ({
            id: item.id,
            mode: item.type === "0" ? "practice" : "exam",
            score: item.totalScore || 0,
            date: this.formatDateTime(item.startTime),
            duration: this.calculateDuration(item.startTime, item.endTime),
            correct: "-",
            wrong: "-",
          }));

          if (isRefresh) {
            this.historyList = formattedData;
          } else {
            this.historyList = [...this.historyList, ...formattedData];
          }

          this.hasMore = formattedData.length === this.pageSize;
        })
        .catch((err) => {
          console.error("获取历史记录失败:", err);
          uni.showToast({
            title: "获取历史记录失败",
            icon: "none",
          });
        })
        .finally(() => {
          if (isRefresh) {
            this.isRefreshing = false;
          }
        });
    },

    formatDateTime(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hour = String(date.getHours()).padStart(2, "0");
      const minute = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hour}:${minute}`;
    },

    calculateDuration(startTime, endTime) {
      if (!startTime || !endTime) return "-";
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diff = Math.floor((end - start) / 1000);

      if (diff < 60) {
        return diff + "秒";
      } else if (diff < 3600) {
        return Math.floor(diff / 60) + "分钟";
      } else {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        return `${hours}小时${minutes}分钟`;
      }
    },

    loadPaperDetail() {
      TestPaperApi.getPaperDetail(this.paperId)
        .then((res) => {
          this.paperInfo = {
            name: res.data.paperName,
            totalQuestions: res.data.totalNum,
            totalScore: res.data.totalScore,
            paperTypes: res.data.paperTypes,
          };
        })
        .catch((err) => {
          console.error("获取试卷详情失败:", err);
          uni.showToast({
            title: "获取试卷详情失败",
            icon: "none",
          });
        });
    },

    onRefresh() {
      this.isRefreshing = true;
      this.loadHistory(true);
    },

    refreshHistoryList() {
      this.page = 1;
      this.hasMore = true;
      this.historyList = [];
      this.loadHistory(true);
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
  padding: 40rpx;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.paper-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 20rpx;
}

.paper-meta {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.basic-info {
  display: flex;
  gap: 20rpx;
}

.info-item {
  font-size: 28rpx;
  color: #666;
}

.paper-types {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 10rpx;
}

.type-item {
  font-size: 24rpx;
  color: #666;
  background: #f5f7fa;
  padding: 8rpx 20rpx;
  border-radius: 6rpx;
  border: 1px solid #e8eaec;
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

.mode-section,
.history-section {
  background: #fff;
  padding: 40rpx;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.mode-options {
  display: flex;
  gap: 20rpx;
}

.mode-item {
  flex: 1;
  padding: 30rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  transition: all 0.3s ease;
}

.mode-item:active {
  background: #f0f0f0;
  transform: scale(0.98);
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

.history-count {
  font-size: 26rpx;
  color: #999;
  font-weight: normal;
}

.history-list {
  max-height: 800rpx;
}

.history-item {
  padding: 30rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  transition: all 0.3s ease;
}

.history-item:active {
  background: #f0f0f0;
  transform: scale(0.98);
}

.history-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.history-mode {
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
}

.history-mode.practice {
  background: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.history-mode.exam {
  background: rgba(82, 196, 26, 0.1);
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

.load-more {
  text-align: center;
  padding: 20rpx 0;
  color: #999;
  font-size: 24rpx;
}
</style>
