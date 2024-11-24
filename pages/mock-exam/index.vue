<template>
  <view class="mock-exam-container">
    <Navbar title="AI模拟考试" bgColor="#fff" :hideBtn="false" :h5Show="true"></Navbar>
    <!-- 顶部生成按钮区域 -->
    <view class="generate-section">
      <view class="generate-content">
        <u-button
          type="primary"
          @click="handleGenerate"
          shape="circle"
          :customStyle="{
            width: '400rpx',
            height: '88rpx',
            backgroundColor: '#ffffff',
            border: 'none',
          }"
        >
          <text style="color: #2979ff; font-weight: 600">生成模拟题</text>
        </u-button>
        <text class="points-tip">每次消耗0.5积分</text>
      </view>
    </view>

    <!-- 历史记录列表 -->
    <view class="question-list">
      <view class="list-header">
        <text class="list-title">题目列表</text>
      </view>
      <view v-if="questionList.length === 0" class="empty-tip">暂无题目</view>
      <view
        v-else
        v-for="(item, index) in questionList"
        :key="index"
        class="question-item"
        :class="{ 'item-hover': item.status === '0' }"
        @click="handleItemClick(item)"
      >
        <view class="item-left">
          <view class="exam-title">
            {{ item.name }}
            <text
              :class="[
                'status-tag',
                item.status === '1'
                  ? 'generating'
                  : item.status === '2'
                  ? 'failed'
                  : 'completed',
              ]"
            >
              {{
                item.status === "1"
                  ? "生成中"
                  : item.status === "2"
                  ? "生成失败(未扣除积分)"
                  : "已完成"
              }}
            </text>
          </view>
          <view class="exam-time">{{ item.createTime }}</view>
        </view>
        <view class="item-right">
          <template v-if="item.status === '1'">
            <u-loading-icon mode="circle" color="#909399"></u-loading-icon>
          </template>
          <template v-else>
            <view class="item-right-content">
              <view class="practice-count-wrapper">
                <text class="practice-count-label">练习次数</text>
                <text class="practice-count-number">{{ item.practice || 0 }}</text>
              </view>
              <view class="arrow-wrapper">
                <u-icon name="arrow-right" size="28" color="#909399"></u-icon>
              </view>
            </view>
          </template>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getTestPaperList, generateTestPaper } from "@/api/testPaper.js";
import * as AiApi from "@/api/ai.js";
import * as TestPaperApi from "@/api/testPaper.js";
import Navbar from "@/components/navbar/Navbar";
import * as AnswerQuestionsApi from "@/api/answerQuestions.js";

export default {
  components: {
    Navbar,
  },
  data() {
    return {
      questionList: [],
      subjectCode: "",
    };
  },

  onLoad(options) {
    this.subjectCode = options.subjectCode;
    this.initData();
  },

  onShow() {
    this.refreshData();
  },

  // 添加下拉刷新相关配置
  onPullDownRefresh() {
    this.refreshData(true);
  },

  methods: {
    async initData() {
      await this.getQuestionList();
    },

    async getQuestionList() {
      try {
        const res = await TestPaperApi.getAISimulatePaper(this.subjectCode);
        if (res.code === 200) {
          this.questionList = res.data.map((item) => ({
            id: item.id,
            name: item.name,
            createTime: item.createTime,
            status: item.status,
            totalQuestions: item.totalQuestions,
            type: item.type,
            practice: item.practice || 0,
          }));
        }
      } catch (error) {
        console.error("获取题目列表失败:", error);
        uni.showToast({
          title: "获取题目列表失败",
          icon: "none",
        });
      }
    },

    async handleGenerate() {
      if (!this.subjectCode) {
        uni.showToast({
          title: "科目编码不能为空",
          icon: "none",
        });
        return;
      }

      try {
        uni.showLoading({
          title: "正在生成试卷...",
          mask: true,
        });

        const newPaper = {
          id: Date.now(),
          name: `${this.formatDate()}-${this.questionList.length + 1} AI试卷`,
          createTime: new Date().toLocaleString(),
          status: "1",
          totalQuestions: 0,
          type: "1",
        };
        this.questionList.unshift(newPaper);

        await AiApi.generatePaper(this.subjectCode);
        await this.getQuestionList();

        uni.showToast({
          title: "操作成功",
          icon: "success",
        });
      } catch (error) {
        this.questionList.shift();
        uni.showToast({
          title: error.msg + "，未扣除积分",
          icon: "none",
          duration: 2000,
        });
      } finally {
        uni.hideLoading();
      }
    },

    handleItemClick(item) {
      if (item.status === "1") {
        return;
      }
      if (item.status === "2") {
        uni.showModal({
          title: "提示",
          content: "该试卷生成失败，是否重新生成？",
          success: async (res) => {
            if (res.confirm) {
              try {
                uni.showLoading({
                  title: "正在重新生成...",
                  mask: true,
                });
                await AiApi.generatePaper(this.subjectCode);
                await this.refreshData();
                uni.showToast({
                  title: "已开始重新生成",
                  icon: "success",
                });
              } catch (error) {
                uni.showToast({
                  title: (error.msg || "重新生成失败") + "，未扣除积分",
                  icon: "none",
                  duration: 2000,
                });
              } finally {
                uni.hideLoading();
              }
            }
          },
        });
        return;
      }
      this.handleStartExam(item);
    },

    handleStartExam(item) {
      AnswerQuestionsApi.add({
        paperId: item.id,
        type: "0",
      })
        .then((res) => {
          uni.navigateTo({
            url: `/pages/mock-exam/exam?id=${item.id}&mode=0&answerId=${res.data}`,
          });
        })
        .catch((error) => {
          console.error("创建答题记录失败:", error);
          uni.$u.toast("创建答题记录失败");
        });
    },

    // 刷新数据方法
    async refreshData(showToast = false) {
      try {
        await this.getQuestionList();
        if (showToast) {
          uni.showToast({
            title: "刷新成功",
            icon: "success",
          });
        }
      } catch (error) {
        console.error("刷新失败:", error);
        if (showToast) {
          uni.showToast({
            title: "刷新失败",
            icon: "none",
          });
        }
      } finally {
        if (showToast) {
          uni.stopPullDownRefresh();
        }
      }
    },

    formatDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}${month}${day}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.mock-exam-container {
  min-height: 100vh;
  background-color: #ffffff;

  .generate-section {
    padding: 30rpx;
    margin-bottom: 20rpx;
    background: linear-gradient(135deg, #2b6bff 0%, #4785ff 100%);

    .generate-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16rpx;

      .points-tip {
        font-size: 24rpx;
        color: #ffffff;
        opacity: 0.8;
      }

      :deep(.u-button) {
        background-color: #ffffff !important;
        border: none;
        font-size: 30rpx;
        font-weight: 600;
        box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);

        &--disabled {
          background-color: rgba(255, 255, 255, 0.8) !important;

          text {
            color: #999 !important;
          }
        }

        &:active {
          transform: scale(0.98);
          background-color: #f5f7fa !important;
        }
      }
    }
  }

  .question-list {
    padding: 0 30rpx;

    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30rpx;
    }

    .list-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
    }

    .empty-tip {
      text-align: center;
      padding: 120rpx 0;
      color: #999;
      font-size: 28rpx;
    }

    .question-item {
      position: relative;
      background: #ffffff;
      border-radius: 20rpx;
      padding: 30rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;

      &.item-hover {
        transform: translateY(-6rpx);
        box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
      }

      .status-tag {
        display: inline-block;
        padding: 6rpx 20rpx;
        border-radius: 30rpx;
        font-size: 24rpx;
        font-weight: 500;
        margin-left: 16rpx;

        &.generating {
          background-color: rgba(255, 149, 0, 0.1);
          color: #ff9500;
        }

        &.completed {
          background-color: rgba(43, 107, 255, 0.1);
          color: #2b6bff;
        }

        &.failed {
          background-color: rgba(255, 69, 58, 0.1);
          color: #ff4538;
        }
      }

      .item-left {
        .exam-title {
          font-size: 32rpx;
          color: #333;
          font-weight: 600;
          margin-bottom: 12rpx;
          display: flex;
          align-items: center;
        }

        .exam-time {
          font-size: 24rpx;
          color: #999;
          margin-top: 12rpx;
        }
      }

      .item-right {
        display: flex;
        align-items: center;
        margin-top: 20rpx;
        padding-top: 20rpx;
        border-top: 2rpx solid #f5f7fa;

        .item-right-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .practice-count-wrapper {
          display: flex;
          align-items: center;
          gap: 12rpx;

          .practice-count-label {
            font-size: 24rpx;
            color: #909399;
          }

          .practice-count-number {
            font-size: 32rpx;
            color: #2b6bff;
            font-weight: 600;
          }
        }

        .arrow-wrapper {
          display: flex;
          align-items: center;
        }

        :deep(.u-loading-icon) {
          width: 36rpx;
          height: 36rpx;
        }

        :deep(.u-icon) {
          color: #2b6bff !important;
        }
      }
    }
  }
}
</style>
