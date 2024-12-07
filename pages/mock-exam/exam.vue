<template>
  <view>
    <Answer :rawQuestions="questions" :mode="mode" :answerId="answerId" />
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
      paperId: null,
      answerId: null, // 答题记录ID
      examInfo: {
        name: "模拟考试",
      },
      currentIndex: 0,
      selectedAnswer: null,
      questions: [],
      mode: "0", // 默认练习模式
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
    if (options.id) {
      this.paperId = options.id;
      this.mode = options.mode || "0";
      this.answerId = options.answerId;

      // 如果没有 answerId,需要先创建答题记录
      if (!this.answerId) {
        await this.createAnswerRecord();
      }

      await this.fetchExamData();
    }
  },

  methods: {
    // 创建答题记录
    async createAnswerRecord() {
      try {
        const res = await AnswerQuestionsApi.add({
          paperId: this.paperId,
          type: this.mode,
        });
        this.answerId = res.data;
      } catch (error) {
        console.error("创建答题记录失败:", error);
        uni.$u.toast("创建答题记录失败");
      }
    },

    // 获取试卷题目数据
    async fetchExamData() {
      try {
        const res = await TestPaperInfoApi.getQuestionsByPaperId(this.paperId);
        this.questions = res.data;
      } catch (error) {
        uni.$u.toast("加载试卷失败");
        console.error("加载试卷失败:", error);
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

<style lang="scss" scoped>
.exam-container {
  min-height: 100vh;
  background-color: #f5f6fa;
  padding-bottom: 120rpx;
}
</style>
