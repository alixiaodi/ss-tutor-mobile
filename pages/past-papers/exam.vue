<template>
  <view>
    <Answer
      :rawQuestions="questions"
      :answerHistory="answerHistory"
      :answerId="answerId"
      :mode="mode"
    />
  </view>
</template>

<script>
import Answer from "@/components/Answer";
import * as TestPaperInfoApi from "@/api/testpaperInfo";
import * as AnswerQuestionsApi from "@/api/answerQuestions";

export default {
  components: {
    Answer,
  },
  data() {
    return {
      examCode: null,
      examInfo: {
        name: "模拟考试",
      },
      currentIndex: 0,
      selectedAnswer: null,
      questions: [],
      mode: null,
      answerId: null,
      answerHistory: null,
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex] || {};
    },
    isLastQuestion() {
      return this.currentIndex === this.questions.length - 1;
    },
  },
  async onLoad(options) {
    this.examCode = options.id;
    this.mode = options.mode;
    this.answerId = options.answerId;

    console.log("初始化参数:", {
      examCode: this.examCode,
      mode: this.mode,
      answerId: this.answerId,
    });

    // 如果是从考点统计页面进入，直接使用存储的题目数据
    if (options.fromExamPoint === "true") {
      const examPointQuestions = uni.getStorageSync("examPointQuestions");
      if (examPointQuestions) {
        this.questions = examPointQuestions;
        // 清除存储的题目数据
        uni.removeStorageSync("examPointQuestions");
      }
    } else {
      // 获取试题数据
      await this.fetchExamData();
    }

    // 再获取答题历史
    if (this.answerId) {
      await this.fetchAnswerHistory();
    }
  },
  methods: {
    async fetchAnswerHistory() {
      try {
        const res = await AnswerQuestionsApi.getAnswerDetail(this.answerId);
        console.log("答题历史接口返回:", res);
        if (res.code === 200) {
          this.answerHistory = res.data;
          console.log("获取到的答题历史:", this.answerHistory);
        }
      } catch (error) {
        console.error("获取历史答题记录失败:", error);
        uni.showToast({
          title: "获取历史答题记录失败",
          icon: "none",
        });
      }
    },
    async fetchExamData() {
      try {
        const res = await TestPaperInfoApi.getQuestionsByPaperId(this.examCode);
        console.log("试题数据接口返回:", res);
        this.questions = res.data;
        console.log("处理后的试题数据:", this.questions);
      } catch (error) {
        console.error("获取试题失败:", error);
        uni.showToast({
          title: "获取试题失败",
          icon: "none",
        });
      }
    },
    selectAnswer(index) {
      this.selectedAnswer = index;
    },
    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    },
    nextQuestion() {
      if (this.isLastQuestion) {
        this.submitExam();
      } else {
        this.currentIndex++;
      }
    },
    submitExam() {
      uni.showModal({
        title: "提示",
        content: "确认提交试卷？",
        success: (res) => {
          if (res.confirm) {
            uni.navigateBack();
          }
        },
      });
    },
  },
};
</script>

<style scoped>
.exam-container {
  min-height: 100vh;
  background-color: #f5f6fa;
  padding-bottom: 120rpx;
}

.header {
  background-color: #fff;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #eee;
}

.exam-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.exam-progress {
  font-size: 28rpx;
  color: #666;
}

.question-container {
  background-color: #fff;
  margin: 30rpx;
  padding: 30rpx;
  border-radius: 12rpx;
}

.question-text {
  font-size: 32rpx;
  line-height: 1.6;
  color: #333;
}

.options-list {
  margin-top: 30rpx;
}

.option-item {
  padding: 20rpx;
  margin-bottom: 20rpx;
  background-color: #f8f9fa;
  border-radius: 8rpx;
}

.option-item.selected {
  background-color: #ecf5ff;
  border: 2rpx solid #409eff;
}

.option-text {
  font-size: 30rpx;
  line-height: 1.5;
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}
</style>
