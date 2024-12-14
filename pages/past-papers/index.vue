<template>
  <view class="mock-exam">
    <Navbar title="历年真题" bgColor="#fff" :hideBtn="false" :h5Show="true"></Navbar>
    <view class="header">
      <text class="title">试卷列表</text>
    </view>
    <view v-if="examList.length === 0" class="empty-state">
      <u-empty
        mode="data"
        icon="/static/img/empty-data.png"
        text="暂无试卷数据"
      ></u-empty>
    </view>
    <view v-else class="exam-list">
      <view
        v-for="item in examList"
        :key="item.id"
        class="exam-item"
        @click="goToExam(item.id)"
      >
        <view class="exam-info">
          <text class="exam-name">{{ item.name }}</text>
          <view class="exam-meta">
            <text class="count">题目数量：{{ item.totalQuestions }}</text>
            <text class="time">{{ item.createTime }}</text>
          </view>
        </view>
        <u-icon name="arrow-right" color="#999" size="28"></u-icon>
      </view>
    </view>
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import * as TestPaperApi from "@/api/testPaper";
export default {
  components: { Navbar },
  name: "MockExam",
  data() {
    return {
      subjectCode: "",
      examList: [],
    };
  },
  onLoad(options) {
    if (options.subjectCode) {
      this.subjectCode = options.subjectCode;
    }
  },
  onShow() {
    if (this.subjectCode) {
      this.fetchExamData();
    } else {
      uni.switchTab({
        url: "/pages/index/index",
      });
    }
  },
  methods: {
    goToExam(examId) {
      uni.navigateTo({
        url: `/pages/past-papers/history?id=${examId}`,
      });
    },
    async fetchExamData() {
      await TestPaperApi.getYearPaper(this.subjectCode).then((res) => {
        this.examList = res.data;
      });
    },
  },
};
</script>

<style scoped>
.mock-exam {
  padding: 30rpx;
  background-color: #f5f6fa;
  min-height: 100vh;
}

.header {
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.exam-list {
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.exam-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.exam-item:active {
  background-color: #f5f5f5;
}

.exam-info {
  flex: 1;
  margin-right: 20rpx;
}

.exam-name {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 12rpx;
  display: block;
}

.exam-meta {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
}

.count {
  margin-right: 20rpx;
}

.time {
  color: #999;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400rpx;
  background-color: #fff;
  border-radius: 12rpx;
  margin-top: 20rpx;
}
</style>
