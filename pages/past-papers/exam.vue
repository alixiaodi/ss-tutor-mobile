<template>
  <view>
    <Answer :rawQuestions="questions" />
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

    if (this.answerId) {
      await this.fetchAnswerHistory();
    }
    await this.fetchExamData();
  },
  methods: {
    async fetchAnswerHistory() {
      try {
        const res = await AnswerQuestionsApi.getAnswerDetail(this.answerId);
        if (res.code === 200) {
          this.answerHistory = res.data;
          if (Array.isArray(this.answerHistory)) {
            this.answerHistory = {
              answers: this.answerHistory.map((item) => ({
                questionId: item.questionNumber,
                answer: item.answer,
                score: item.score,
                desc: item.desc,
              })),
            };
          }
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
        this.questions = res.data;

        if (this.answerHistory && this.answerHistory.answers) {
          this.questions = this.questions.map((question) => {
            const historicalAnswer = this.answerHistory.answers.find(
              (a) =>
                a.questionId === question.id || a.questionId === question.questionNumber
            );
            if (historicalAnswer) {
              question.userAnswer = historicalAnswer.answer;
              question.score = historicalAnswer.score;
              question.answerDesc = historicalAnswer.desc;
            }
            return question;
          });
        }
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
