<template>
  <view class="mock-exam-container" @click="onMainContainerClick">
    <!-- 固定的头部计时器 -->
    <view class="exam-header">
      <!-- #ifdef H5 -->
      <view class="back-btn" @click="handleBack">
        <svg
          t="1730634015516"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="9822"
          width="16"
          height="16"
        >
          <path
            d="M475 276V141.4c-12.1-56.3-58.2-22-58.2-22L96.6 395.9c-70.4 48.9-4.8 85.7-4.8 85.7l315.4 274.1c63.1 46.5 67.9-24.5 67.9-24.5V606.4C795.3 506 926.3 907.5 926.3 907.5c12.1 22 19.4 0 19.4 0C1069.4 305.4 475 276 475 276z"
            fill="#383838"
            p-id="9823"
          ></path>
        </svg>
        <text class="back-text">首页</text>
      </view>
      <!-- #endif -->
      <view class="timer"> 答题用时: {{ formatTime }} </view>
      <!-- 添加提交按钮 -->
      <view class="submit-btn" @click="submitExam">
        <text>提交</text>
      </view>
    </view>

    <!-- ���区域 -->
    <view class="exam-content">
      <swiper class="swiper" :current="currentQuestion" @change="handlePageChange">
        <swiper-item
          v-for="(question, index) in questions"
          :key="index"
          class="swiper-item"
        >
          <view class="question-card" v-if="question">
            <view class="question-title">
              <text class="question-index">{{ index + 1 }}/{{ questions.length }}</text>
              <text class="question-type">{{ getQuestionTypeLabel(question.type) }}</text>
              <text class="question-score">{{ question.score }}分</text>
            </view>
            <view class="question-content">
              <rich-text
                :nodes="formatContent(question.content)"
                user-select
                @tap="onRichTextTap"
                @node-tap="onNodeTap"
              ></rich-text>
            </view>
            <view class="options" v-if="question" :class="question.type">
              <!-- 单选题 -->
              <template v-if="question && question.type === 'single'">
                <view
                  v-for="(option, optIndex) in question.options"
                  :key="option.value"
                  class="option-item"
                  :class="{
                    active: answers[index] === option.value,
                    'correct-option': answers[index] && option.value === question.correct,
                    'wrong-option':
                      answers[index] &&
                      answers[index] === option.value &&
                      option.value !== question.correct,
                  }"
                  @click="selectAnswer(index, option.value)"
                >
                  <view class="option-prefix">{{ optionLabels[optIndex] }}</view>
                  <view class="option-text">
                    <rich-text :nodes="formatContent(option.text)"></rich-text>
                  </view>
                </view>
              </template>

              <!-- 多选题 -->
              <template v-else-if="question && question.type === 'multiple'">
                <view
                  v-for="(option, optIndex) in question.options"
                  :key="option.value"
                  class="option-item"
                  :class="{
                    active: isOptionSelected(index, option.value),
                    'correct-option':
                      answers[index] && question.correct.includes(option.value),
                    'wrong-option':
                      answers[index] &&
                      isOptionSelected(index, option.value) &&
                      !question.correct.includes(option.value),
                  }"
                  @click="toggleMultipleChoice(index, option.value)"
                >
                  <view class="option-prefix checkbox">{{ optionLabels[optIndex] }}</view>
                  <view class="option-text">
                    <rich-text :nodes="formatContent(option.text)"></rich-text>
                  </view>
                </view>
              </template>

              <!-- 填空题 -->
              <template v-else-if="question && question.type === 'blank'">
                <view class="blank-content">
                  <template
                    v-for="(part, partIndex) in parseBlankContent(question.content)"
                  >
                    <text
                      v-if="part.type === 'text'"
                      :key="'text-' + partIndex"
                      class="blank-text"
                      >{{ part.content }}</text
                    >
                    <view v-else :key="'blank-' + partIndex" class="blank-wrapper">
                      <input
                        class="blank-input"
                        type="text"
                        :value="getBlankAnswer(index, part.index)"
                        :placeholder="'填空' + (part.index + 1)"
                        @input="(e) => updateBlankAnswer(index, part.index, e)"
                      />
                    </view>
                  </template>
                </view>
              </template>

              <!-- 论述题 -->
              <template v-else-if="question && question.type === 'essay'">
                <view class="essay-container">
                  <textarea
                    class="essay-input"
                    :value="answers[index]"
                    :placeholder="question.placeholder || '请输入你的答案...'"
                    :maxlength="question.maxLength || 1000"
                    @input="(e) => updateEssayAnswer(index, e)"
                    auto-height
                  />
                  <view class="essay-footer">
                    <text class="word-count"
                      >{{ getWordCount(answers[index]) }}/{{
                        question.maxLength || 1000
                      }}</text
                    >
                    <text class="tip" v-if="question.minLength"
                      >至少输入 {{ question.minLength }} 字</text
                    >
                  </view>
                </view>
              </template>
            </view>
            <!-- 答案解析部�� -->
            <template v-if="question">
              <view
                v-if="showingAnswer && currentQuestion === index"
                class="explanation-section"
              >
                <view class="explanation-header">
                  <text
                    :class="[
                      'result-text',
                      checkAnswer(question, answers[index]) ? 'correct' : 'wrong',
                    ]"
                  >
                    {{ checkAnswer(question, answers[index]) ? "回答正确" : "回答错误" }}
                  </text>
                  <text
                    v-if="!checkAnswer(question, answers[index])"
                    class="correct-answer"
                  >
                    正确答案: {{ question.correct }}
                  </text>
                </view>
                <view
                  v-if="question.explanation && question.explanation.trim()"
                  class="explanation-content"
                >
                  <text class="explanation-label">解析：</text>
                  <rich-text :nodes="formatContent(question.explanation)"></rich-text>
                </view>
              </view>
            </template>
          </view>
        </swiper-item>
      </swiper>

      <view class="exam-footer" @click.stop>
        <view
          class="nav-btn"
          @click="prevQuestion"
          :class="{ disabled: currentQuestion === 0 }"
        >
          <text>上一题</text>
        </view>

        <!-- 填空题和简答题的操作按钮 -->
        <view class="center-btns">
          <template
            v-if="
              currentQuestionData &&
              (isBlankQuestion(currentQuestionData.type) ||
                currentQuestionData.type === 'essay')
            "
          >
            <template v-if="!showingAnswer">
              <view class="submit-answer-btn" @click="submitCurrentAnswer">
                <text>完成作答</text>
              </view>
            </template>
            <view
              class="view-answer-btn"
              :class="{ active: showingAnswer }"
              @click="toggleAnswerView"
            >
              <text class="btn-icon" :class="{ active: showingAnswer }">{{
                showingAnswer ? "✕" : "?"
              }}</text>
              <text class="btn-text">{{ showingAnswer ? "隐藏答案" : "查看答案" }}</text>
            </view>
          </template>
          <template v-else-if="currentQuestionData">
            <view
              class="view-answer-btn"
              :class="{ active: showingAnswer }"
              @click="toggleAnswerView"
            >
              <text class="btn-icon" :class="{ active: showingAnswer }">{{
                showingAnswer ? "✕" : "?"
              }}</text>
              <text class="btn-text">{{ showingAnswer ? "隐藏答案" : "查看答案" }}</text>
            </view>
          </template>
        </view>

        <view
          class="nav-btn"
          @click="nextQuestion"
          :class="{ disabled: currentQuestion === questions.length - 1 }"
        >
          <text>下一题</text>
        </view>
      </view>
    </view>

    <!-- 答题卡屉 -->
    <view class="answer-card-drawer" :class="{ 'drawer-open': showAnswerCard }">
      <view class="drawer-content" @click.stop>
        <view class="drawer-header">
          <text>答题卡</text>
          <text class="answered-count"
            >已答 {{ answeredCount }}/{{ questions.length }}</text
          >
        </view>
        <!-- 添加scroll-view -->
        <scroll-view class="question-grid-scroll" scroll-y>
          <view class="question-grid">
            <view
              v-for="(question, index) in questions"
              :key="index"
              :class="[
                'question-item',
                {
                  current: currentQuestion === index,
                  unanswered:
                    !answers[index] || updateQuestionStatus(index) === 'unanswered',
                  answered:
                    answers[index] && updateQuestionStatus(index) !== 'unanswered',
                  correct: answers[index] && updateQuestionStatus(index) === 'correct',
                  wrong: answers[index] && updateQuestionStatus(index) === 'wrong',
                  pending: answers[index] && updateQuestionStatus(index) === 'pending',
                },
              ]"
              @click="jumpToQuestion(index)"
            >
              <text class="question-number">{{ index + 1 }}</text>
              <text class="question-type-tag">{{
                getQuestionTypeLabel(question.type)
              }}</text>
              <text
                v-if="answers[index] && updateQuestionStatus(index) !== 'unanswered'"
                class="status-icon"
              >
                {{ getStatusIcon(updateQuestionStatus(index)) }}
              </text>
            </view>
          </view>
        </scroll-view>
      </view>
      <movable-area class="handle-area">
        <movable-view
          class="drawer-handle"
          direction="all"
          :x="handleX"
          :y="handleY"
          :out-of-bounds="false"
          :damping="60"
          :friction="3"
          :inertia="true"
          @change="onHandleMove"
          @touchend="onHandleTouchEnd"
          @click.stop="toggleAnswerCard"
        >
          <text class="handle-text">答题卡</text>
        </movable-view>
      </movable-area>
    </view>

    <!-- 自定义图片预览弹窗 -->
    <!-- #ifdef H5 || MP || APP-PLUS -->
    <view v-if="previewImage" class="image-preview" @click="closePreview">
      <!-- APP端使用image组件 -->
      <!-- #ifdef APP-PLUS -->
      <image
        :src="previewImage"
        mode="aspectFit"
        class="preview-image"
        @click.stop
        :style="{
          width: '100%',
          height: '100%',
        }"
      />
      <!-- #endif -->

      <!-- 其他平台使用普通image -->
      <!-- #ifdef H5 || MP -->
      <image :src="previewImage" mode="aspectFit" class="preview-image" @click.stop />
      <!-- #endif -->

      <view class="close-btn" @click.stop="closePreview">×</view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
import * as AiApi from "@/api/ai";
import * as AnswerQuestionsApi from "@/api/answerQuestions";

export default {
  data() {
    return {
      optionLabels: ["A", "B", "C", "D", "E", "F", "G", "H"],
      questions: [], // 将从外部接收数
      answers: [],
      remainingTime: 3600,
      currentQuestion: 0,
      showAnswerCard: false,
      handleX: 0,
      handleY: 200,
      screenWidth: 0,
      screenHeight: 0,
      handleWidth: 0, // 新增：存储实际手柄宽度
      handleHeight: 0, // 新增存储实际手柄高度
      showingAnswer: false, // 添加新的数据属性
      isMoving: false, // 新增踪是正在移动
      isOnLeft: false, // 新增：跟踪是否在左侧
      isDragging: false, // 新增：跟踪是否正在拖动
      lastX: 0, // 新增：记一次的X位置
      previewImage: "", // 添加预览片的URL
      statusBarHeight: 0, // 添加状态栏高度
      id: null, // 题目ID
      mode: null, // 模式
      answerId: null, // 答案ID
      startTime: null, // 添加开始时间
      usedTime: 0, // 添加已用时间
      timer: null, // 添加计时器引用
    };
  },

  props: {
    rawQuestions: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    rawQuestions: {
      immediate: true,
      handler(newQuestions) {
        if (newQuestions.length) {
          this.questions = this.transformQuestions(newQuestions);
          this.answers = new Array(this.questions.length).fill(null);
        }
      },
    },
  },

  computed: {
    formatTime() {
      const minutes = Math.floor(this.usedTime / 60);
      const seconds = this.usedTime % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    },
    answeredCount() {
      return this.answers.filter((answer) => answer).length;
    },
    shouldShowViewAnswerButton() {
      return true;
    },
    shouldShowSubmitButton() {
      const currentQuestion = this.questions[this.currentQuestion];
      return (
        currentQuestion &&
        (this.isBlankQuestion(currentQuestion.type) || currentQuestion.type === "essay")
      );
    },
    currentQuestionData() {
      return this.questions[this.currentQuestion] || null;
    },
  },

  methods: {
    getQuestionTypeLabel(type) {
      if (!type) return "";
      const types = {
        single: "单选",
        multiple: "多选",
        blank: "填空",
        essay: "简答",
      };
      return types[type] || "未知";
    },

    selectAnswer(index, value) {
      // 如果已经选择了答案，不允许再次选择
      if (this.answers[index]) return;

      // 设置答案
      this.$set(this.answers, index, value);

      console.log("我是选择题");
      console.log("this.answerId", this.answerId);

      console.log({
        answerQuestionsId: this.answerId,
        answer: value,
        questionNumber: this.questions[index].id,
      });
      AnswerQuestionsApi.uploadAnswer({
        answerQuestionsId: this.answerId,
        answer: value,
        questionNumber: this.questions[index].id,
      });

      // TODO: 调用题记录接口
      // AnswerQuestionsApi.record({
      //   answerId: this.answerId,
      //   questionId: this.questions[index].id,
      //   answer: value
      // });

      // 对于单选题
      if (this.questions[index].type === "single") {
        // 显示答案解析
        this.showingAnswer = true;

        // 检查答案是否正确
        const isCorrect = this.checkAnswer(this.questions[index], value);

        if (isCorrect) {
          setTimeout(() => {
            if (index < this.questions.length - 1) {
              this.currentQuestion = index + 1;
              this.showingAnswer = false;
            }
          }, 800);
        }
      }
    },

    toggleMultipleChoice(questionIndex, value) {
      const currentAnswers = this.answers[questionIndex] || [];
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((v) => v !== value)
        : [...currentAnswers, value];
      this.$set(this.answers, questionIndex, newAnswers);

      // TODO: 调用答题记录接口
      // AnswerQuestionsApi.record({
      //   answerId: this.answerId,
      //   questionId: this.questions[questionIndex].id,
      //   answer: newAnswers
      // });

      // 检查多选题是否答对
      const question = this.questions[questionIndex];
      if (
        this.checkMultipleAnswer(newAnswers, question.correct) &&
        questionIndex < this.questions.length - 1
      ) {
        setTimeout(() => {
          this.currentQuestion++;
        }, 500);
      }
    },

    isOptionSelected(questionIndex, value) {
      const answers = this.answers[questionIndex];
      return Array.isArray(answers) && answers.includes(value);
    },

    updateBlankAnswer(questionIndex, blankIndex, event) {
      const value = event.detail.value || event.target.value;
      const currentAnswers = Array.isArray(this.answers[questionIndex])
        ? [...this.answers[questionIndex]]
        : [];

      currentAnswers[blankIndex] = value;
      this.$set(this.answers, questionIndex, currentAnswers);
    },

    updateEssayAnswer(index, e) {
      // uniapp 的事件对象中，值在 e.detail.value 中
      const value = e.detail.value;
      console.log("简答题输入:", {
        index,
        value,
        event: e,
      });

      // 使用 $set 更新数组
      this.$set(this.answers, index, value);

      // 上传答案
      AnswerQuestionsApi.uploadAnswer({
        answerQuestionsId: this.answerId,
        answer: value,
        questionNumber: this.questions[index].id,
      });
    },

    submitExam() {
      // TODO 打印所有答案信息
      console.log("提交的所有答案：");
      const data = this.answers.map((answer, index) => ({
        answerQuestionsId: this.answerId,
        answer: Array.isArray(answer) ? answer.join(",") : answer,
        questionNumber: this.questions[index].id,
        questionType: this.questions[index].type,
        usedTime: this.usedTime, // 添加用时
      }));
      // 原有的提交逻辑
      console.log("提交的答案：", this.answerId);
      AnswerQuestionsApi.submit(this.answerId, data).then((res) => {
        uni.showToast({
          title: "提交成功",
          icon: "success",
          duration: 2000,
        });
        // 返回上一页
        console.log("返回上一页");
        uni.navigateBack();
      });
    },
    handlePageChange(e) {
      const oldQuestion = this.currentQuestion;
      const newQuestion = e.detail.current;

      // 获取离开的题目信息
      if (oldQuestion !== newQuestion) {
        const currentQuestion = this.questions[oldQuestion];
        const answer = this.answers[oldQuestion];

        console.log("页面切换信息:", {
          oldQuestion,
          newQuestion,
          currentQuestionType: currentQuestion?.type,
          answer,
          answers: this.answers,
        });

        // 添加条件判断的详细日志
        console.log("条件判断详情:", {
          isEssayType: currentQuestion?.type === "essay",
          hasAnswer: !!answer,
          rawAnswer: answer,
        });

        if (currentQuestion?.type === "blank" || currentQuestion?.type === "essay") {
          console.log("提交答案:", {
            questionId: currentQuestion.id,
            answer: answer,
            answerId: this.answerId,
          });
          AnswerQuestionsApi.uploadAnswer({
            answerQuestionsId: this.answerId,
            answer: answer.join(","),
            questionNumber: currentQuestion.id,
          }).then((res) => {
            console.log("上传答案结果:", res);
          });
        }
      }

      this.currentQuestion = newQuestion;
      this.showingAnswer = false;
    },

    prevQuestion() {
      if (this.currentQuestion > 0) {
        this.currentQuestion--;
      }
    },

    nextQuestion() {
      if (this.currentQuestion < this.questions.length - 1) {
        // TODO: 如果是填空题或论述题，且已作答，调用评判接口
        const currentQuestion = this.questions[this.currentQuestion];
        const answer = this.answers[this.currentQuestion];
        if (
          (this.isBlankQuestion(currentQuestion?.type) ||
            currentQuestion?.type === "essay") &&
          answer
        ) {
          // TODO: 实现 judge 接口调用
          // await AiApi.judge(currentQuestion.id, answer, this.answerId);
        }

        this.currentQuestion++;
      }
    },

    toggleAnswerCard(e) {
      e.stopPropagation();
      this.showAnswerCard = !this.showAnswerCard;
    },

    jumpToQuestion(index) {
      // 手动构造事件对象
      const event = {
        detail: {
          current: index,
        },
      };

      // 先调用 handlePageChange
      this.handlePageChange(event);

      // 然后更新当前题目索引并关闭答题卡
      this.currentQuestion = index;
      this.showAnswerCard = false;
    },

    onHandleMove(e) {
      if (!this.isDragging) {
        this.isDragging = true;
        this.lastX = e.detail.x;
      }

      const middlePoint = this.screenWidth / 2;
      const currentX = e.detail.x;

      // 只有移动距离超过阈时才更新位
      if (Math.abs(currentX - this.lastX) > 5) {
        if (currentX < middlePoint && !this.isOnLeft) {
          this.isOnLeft = true;
          this.handleX = 0;
        } else if (currentX >= middlePoint && this.isOnLeft) {
          this.isOnLeft = false;
          this.handleX = this.screenWidth - this.handleWidth;
        }
        this.lastX = currentX;
      }

      // 滑处理Y轴移动
      const newY = Math.max(
        0,
        Math.min(e.detail.y, this.screenHeight - this.handleHeight)
      );
      // 只有移动超过一定距离才更新Y值
      if (Math.abs(this.handleY - newY) > 2) {
        this.handleY = newY;
      }
    },

    onHandleTouchEnd() {
      if (!this.isDragging) return;

      this.isDragging = false;
      this.handleX = this.isOnLeft ? 0 : this.screenWidth - this.handleWidth;

      // 确保Y轴位置在有效范围内
      this.handleY = Math.max(
        0,
        Math.min(this.handleY, this.screenHeight - this.handleHeight)
      );

      this.saveHandlePosition();
    },

    // 新增保存位置方法
    saveHandlePosition() {
      try {
        uni.setStorageSync("drawerHandlePosition", {
          x: this.handleX,
          y: this.handleY,
          isOnLeft: this.isOnLeft,
        });
      } catch (e) {
        console.error("Failed to save position:", e);
      }
    },

    // 修 initHandlePosition 方法
    initHandlePosition() {
      this.initSizes();

      try {
        const saved = uni.getStorageSync("drawerHandlePosition");
        if (saved && this.isValidPosition(saved)) {
          this.isOnLeft = saved.isOnLeft;
          this.handleX = this.isOnLeft ? 0 : this.screenWidth - this.handleWidth;
          this.handleY = saved.y;
          this.lastX = this.handleX;
        } else {
          this.isOnLeft = false;
          this.handleX = this.screenWidth - this.handleWidth;
          this.handleY = 200;
          this.lastX = this.handleX;
        }
      } catch (e) {
        console.error("Failed to load position:", e);
        this.isOnLeft = false;
        this.handleX = this.screenWidth - this.handleWidth;
        this.handleY = 200;
        this.lastX = this.handleX;
      }
    },

    isValidPosition(pos) {
      return (
        pos &&
        typeof pos.x === "number" &&
        typeof pos.y === "number" &&
        pos.x >= 0 &&
        pos.x <= this.screenWidth - this.handleWidth &&
        pos.y >= 0 &&
        pos.y <= this.screenHeight - this.handleHeight
      );
    },

    onMainContainerClick() {
      if (this.showAnswerCard) {
        this.showAnswerCard = false;
      }
    },

    handleBack() {
      // 直接返回上一页或首页,不调用提交
      uni.navigateBack({
        delta: 1,
        fail: () => {
          // 如果返回失败(没有上一页),则跳转首页
          uni.reLaunch({
            url: "/pages/index/index",
          });
        },
      });
    },

    // 解析填空题内容，将文本和空位置分开
    parseBlankContent(content) {
      const parts = [];
      let lastIndex = 0;
      let blankIndex = 0;

      // 匹配连下划线（6个或）
      const blankRegex = /_{6,}/g;
      let match;

      while ((match = blankRegex.exec(content)) !== null) {
        // 添加空的文本
        if (match.index > lastIndex) {
          parts.push({
            type: "text",
            content: content.substring(lastIndex, match.index),
          });
        }

        // 添加填空
        parts.push({
          type: "blank",
          index: blankIndex++,
        });

        lastIndex = match.index + match[0].length;
      }

      // 添加最后剩余的文本
      if (lastIndex < content.length) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex),
        });
      }

      return parts;
    },

    // 获取填空答案
    getBlankAnswer(questionIndex, blankIndex) {
      const answers = this.answers[questionIndex] || [];
      return answers[blankIndex] || "";
    },

    // 检查空题答案是否正确
    checkBlankAnswer(questionIndex) {
      const question = this.questions[questionIndex];
      const answers = this.answers[questionIndex] || [];
      return question.blanks.every(
        (correct, index) => answers[index]?.trim().toLowerCase() === correct.toLowerCase()
      );
    },

    getWordCount(text) {
      return text ? text.length : 0;
    },

    validateEssayAnswer(index) {
      const question = this.questions[index];
      const answer = this.answers[index];

      if (!answer) return false;

      const wordCount = this.getWordCount(answer);
      return (
        (!question.minLength || wordCount >= question.minLength) &&
        (!question.maxLength || wordCount <= question.maxLength)
      );
    },

    // 转换题目数据格式
    transformQuestions(rawQuestions) {
      return rawQuestions.map((q) => ({
        id: q.id,
        type: this.getQuestionType(q.type),
        content: q.title,
        score: q.score,
        options: this.transformOptions(q.options),
        correct: q.answer,
        explanation: q.analysis,
        sort: q.sort,
        blanks:
          this.getQuestionType(q.type) === "blank" ? this.parseBlankCount(q.title) : [],
      }));
    },

    // 解析填空题中的空的数量
    parseBlankCount(content) {
      const underscoreMatches = content.match(/_{2,}/g) || []; // 匹配连续的下划线
      const bracketsMatches = content.match(/\[.*?\]/g) || []; // 匹配方括号
      const blankMatches = content.match(/（\s*）/g) || []; // 匹配中文括号空格

      const totalBlanks =
        underscoreMatches.length + bracketsMatches.length + blankMatches.length;
      return Array(totalBlanks).fill("");
    },

    // 解析填空题内容将下划线等转换为输入
    parseBlankContent(content) {
      const parts = [];
      let lastIndex = 0;
      let blankIndex = 0;

      // 处理多种可能填空格式
      const blankRegex = /_{2,}|\[.*?\]|（\s*）/g;
      let match;

      while ((match = blankRegex.exec(content)) !== null) {
        // 添加填空的文本
        if (match.index > lastIndex) {
          parts.push({
            type: "text",
            content: content.substring(lastIndex, match.index),
          });
        }

        // 添加填空
        parts.push({
          type: "blank",
          index: blankIndex++,
        });

        lastIndex = match.index + match[0].length;
      }

      // 添加最后剩余的文本
      if (lastIndex < content.length) {
        parts.push({
          type: "text",
          content: content.substring(lastIndex),
        });
      }

      return parts;
    },

    // 获取填空答案
    getBlankAnswer(questionIndex, blankIndex) {
      if (!this.answers[questionIndex]) {
        this.$set(this.answers, questionIndex, []);
      }
      return this.answers[questionIndex][blankIndex] || "";
    },

    // 更新填空答案
    updateBlankAnswer(questionIndex, blankIndex, event) {
      if (!this.answers[questionIndex]) {
        this.$set(this.answers, questionIndex, []);
      }
      this.$set(this.answers[questionIndex], blankIndex, event.detail.value);
    },

    // 转换选项
    transformOptions(optionsStr) {
      try {
        const options = JSON.parse(optionsStr);
        return Object.entries(options)
          .filter(([_, text]) => text.trim()) // 过滤掉空选项
          .map(([value, text]) => ({
            value: value.toUpperCase(),
            text: text.trim(),
          }));
      } catch (e) {
        return [];
      }
    },

    // 获取题目类型
    getQuestionType(type) {
      const typeMap = {
        单选: "single",
        多选: "multiple",
        填空题: "blank",
        简答题: "essay",
        论述题: "essay",
      };
      return typeMap[type] || "single";
    },

    // 检查答案是正确
    checkAnswer(question, userAnswer) {
      // 如果没有答案，直接返回 null
      if (!userAnswer) return null;

      switch (question.type) {
        case "blank":
          // 填空题未完成时返回 null
          if (!this.isBlankAnswerComplete(userAnswer)) {
            return null;
          }
          // TODO: 实际的填空题答比对逻辑
          // console.log("填空题答案比对逻辑");
          return null; // 暂时返 null，不显示对错

        case "essay":
          return "pending";

        case "single":
        case "multiple":
          return userAnswer === question.correct;

        default:
          return null;
      }
    },

    // 提交答案
    async submitAnswer() {
      // ... 他代码 ...

      // 历所有答案进行判断
      for (let i = 0; i < this.questions.length; i++) {
        const question = this.questions[i];
        const answer = this.answers[i];

        if (question.type === "essay") {
          // TODO: 调用后接口提交简答题/论述题答案
          try {
            // const response = await uni.request({
            //   url: '/api/submit-essay',
            //   method: 'POST',
            //   data: {
            //     questionId: question.id,
            //     answer: answer,
            //     type: question.type
            //   }
            // })
            // 可以处理提交响应
            // this.answerResults[i] = response.data.result
          } catch (error) {
            console.error("提交案失败:", error);
          }
        }
      }
    },

    // 更答题卡显示状态
    updateQuestionStatus(index) {
      const question = this.questions[index];
      const answer = this.answers[index];

      // 没答案时显示未
      if (!answer) return "unanswered";

      // 填空题特殊处理
      if (question.type === "blank") {
        if (!this.isBlankAnswerComplete(answer)) {
          return "unanswered";
        }
      }

      // 简答题显示待批改
      if (question.type === "essay") {
        return "pending";
      }

      const result = this.checkAnswer(question, answer);
      if (result === null) return "unanswered";
      if (result === "pending") return "pending";
      return result ? "correct" : "wrong";
    },

    // 获状态图标
    getStatusIcon(status) {
      switch (status) {
        case "correct":
          return "✓";
        case "wrong":
          return "×";
        case "pending":
          return "...";
        case "unanswered":
        default:
          return "";
      }
    },

    // 检查填空题是否已完成作答
    isBlankAnswerComplete(answer) {
      if (!Array.isArray(answer)) return false;
      return answer.every((item) => item?.trim());
    },

    // 是否显示答案解析
    shouldShowExplanation(index) {
      const question = this.questions[index];
      const answer = this.answers[index];

      // 没有答案不显示解析
      if (!answer) return false;

      // 填空题特殊处理必须完全填写才显示解析
      if (this.isBlankQuestion(question.type)) {
        return this.isBlankAnswerComplete(answer);
      }

      // 简答不显示解析
      if (question.type === "essay") return false;

      return true;
    },

    // 判断是为填空题
    isBlankQuestion(type) {
      return type && type === "blank";
    },

    // 修改方法：检查填空题答案是否有效（需要处理答案数组不存在的情况）
    hasValidBlankAnswer(answer) {
      // 检查 answer 是否存在，是数组
      if (!answer || !Array.isArray(answer)) return false;

      // 查是否所有空都已写且不是空字符串
      return (
        answer.length > 0 &&
        answer.every((item) => {
          // 检查每个答案是否存在且不纯格
          return item !== undefined && item !== null && item.trim().length > 0;
        })
      );
    },

    // 新增：查多选题答案是否完全正确
    checkMultipleAnswer(userAnswer, correctAnswer) {
      if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) return false;
      if (userAnswer.length !== correctAnswer.length) return false;

      // 排序后比较，确保选择顺序不影响结果
      const sortedUser = [...userAnswer].sort();
      const sortedCorrect = [...correctAnswer].sort();
      return sortedUser.every((value, index) => value === sortedCorrect[index]);
    },

    // 加新方法
    ensureHandlePosition() {
      const systemInfo = uni.getSystemInfoSync();
      this.screenWidth = systemInfo.windowWidth;
      this.screenHeight = systemInfo.windowHeight;

      // 强制执行吸附
      this.handleX = this.screenWidth - uni.upx2px(80);
      this.handleY = 200;
      this.onHandleTouchEnd();
    },

    // 修改切换答案显示方法
    toggleAnswerView() {
      const currentQuestion = this.questions[this.currentQuestion];
      const isEssayOrBlank =
        this.isBlankQuestion(currentQuestion.type) || currentQuestion.type === "essay";

      // 如果是填空或简答题，且已经提交答，才允许查看答案
      if (isEssayOrBlank && !this.answers[this.currentQuestion]) {
        uni.showToast({
          title: "请先完成作答",
          icon: "none",
        });
        return;
      }

      this.showingAnswer = !this.showingAnswer;
    },

    // 修改提交答案方法
    async submitCurrentAnswer() {
      const currentQuestion = this.questions[this.currentQuestion];
      const answer = this.answers[this.currentQuestion];

      if (!answer || (Array.isArray(answer) && answer.some((a) => !a))) {
        uni.showToast({
          title: "请完成所有答案",
          icon: "none",
        });
        return;
      }

      // TODO: 调用答题记录接口
      // try {
      //   await AnswerQuestionsApi.record({
      //     answerId: this.answerId,
      //     questionId: currentQuestion.id,
      //     answer: answer
      //   });
      // } catch (error) {
      //   console.error('提交答案失败:', error);
      //   uni.showToast({
      //     title: '提交败，请重试',
      //     icon: 'none'
      //   });
      //   return;
      // }

      try {
        const res = await AiApi.judge(currentQuestion.id, answer, this.answerId);
        if (res.code === 200) {
          uni.showModal({
            title: "评分结果",
            content: `得分：<span style="color: #52c41a; font-weight: bold;">${res.data.score}分</span>\n评语：<span style="color: #666666;">${res.data.analysis}</span>`.replace(
              /<[^>]+>/g,
              ""
            ),
            showCancel: true,
            cancelText: "查看答案",
            confirmText: "确定",
            success: (result) => {
              if (result.cancel) {
                this.showingAnswer = true;
              }
            },
          });
        }
      } catch (error) {
        console.error("提交答案失败:", error);
        uni.showToast({
          title: "提交失败，请重试",
          icon: "none",
        });
      }
    },

    // 新增：初化���寸方法
    initSizes() {
      const sysInfo = uni.getSystemInfoSync();
      this.screenWidth = sysInfo.windowWidth;
      this.screenHeight = sysInfo.windowHeight;

      // 转换手柄尺寸（80rpx 和 180rpx）
      this.handleWidth = Math.ceil((80 * this.screenWidth) / 750);
      this.handleHeight = Math.ceil((180 * this.screenWidth) / 750);

      console.log("Screen size:", {
        width: this.screenWidth,
        height: this.screenHeight,
        handleWidth: this.handleWidth,
        handleHeight: this.handleHeight,
      });
    },

    formatContent(content) {
      if (!content) return "";

      content = content.replace(/&lt;br&gt;/g, "<br>");

      // 修改图片标签，添加自定义类名和点击事件处理
      content = content
        .replace(/&lt;img\s+src="([^"]+)".*?&gt;/g, (match, url) => {
          return `<img 
            src="${url}" 
            class="preview-image" 
            style="max-width: 100%; height: auto; display: block; margin: 10rpx 0;" 
            data-src="${url}"
            onclick="document.dispatchEvent(new CustomEvent('previewImage', {detail: '${url}'}));"
          />`;
        })
        .replace(/<img\s+src="([^"]+)".*?>/g, (match, url) => {
          return `<img 
            src="${url}" 
            class="preview-image" 
            style="max-width: 100%; height: auto; display: block; margin: 10rpx 0;" 
            data-src="${url}"
            onclick="document.dispatchEvent(new CustomEvent('previewImage', {detail: '${url}'}));"
          />`;
        });

      return content;
    },

    onRichTextTap(e) {
      console.log("rich-text tap event:", e);

      // 获取当前题目中的所有图片
      const imgUrls = this.extractImageUrls(this.questions[this.currentQuestion].content);
      console.log("可预览的图片列表:", imgUrls);

      if (imgUrls.length > 0) {
        // 使用 uniapp 原生预览组件
        uni.previewImage({
          current: 0, // 默认显示第一张
          urls: imgUrls,
          indicator: "number",
          loop: true,
          success: () => {
            console.log("图片预览成功");
          },
          fail: (err) => {
            console.error("图片预览失败:", err);
            // 预览失败时的处理
            uni.showToast({
              title: "图片预览失败",
              icon: "none",
            });
          },
        });
      }
    },

    onNodeTap(e) {
      console.log("rich-text node-tap event:", e);
      if (e.detail?.node?.name === "img") {
        const url = e.detail?.node?.attrs?.src;
        console.log("Tapped image URL:", url);
        if (url) {
          uni.previewImage({
            urls: [url],
            current: 0,
            success: () => {
              console.log("预览成功");
            },
            fail: (err) => {
              console.error("预览失败:", err);
            },
          });
        }
      }
    },

    extractImageUrls(content) {
      const urls = [];
      const regex1 = /&lt;img\s+src="([^"]+)"/g;
      const regex2 = /<img\s+src="([^"]+)"/g;

      let match;
      while ((match = regex1.exec(content)) !== null) {
        urls.push(match[1]);
      }
      while ((match = regex2.exec(content)) !== null) {
        urls.push(match[1]);
      }

      return [...new Set(urls)]; // 去重
    },
  },
  mounted() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1]; // 当前页面实例
    const options = currentPage.options; // 当前页面的路径参数
    console.log("路径参数:", options);
    this.id = options.id;
    this.mode = options.mode;
    this.answerId = options.answerId;

    // 设置开始时间
    this.startTime = Date.now();

    // 启动计时器
    this.timer = setInterval(() => {
      this.usedTime = Math.floor((Date.now() - this.startTime) / 1000);
    }, 1000);

    // 初始化位置
    this.$nextTick(() => {
      this.initHandlePosition();
    });
  },

  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
};
</script>

<style scoped>
.mock-exam-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
}

.exam-content {
  position: relative;
  height: 100vh;
  width: 100%;
  padding-top: 60rpx;
  /* 减顶部间距 */
  padding-bottom: 100rpx;
  box-sizing: border-box;
}

.exam-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80rpx;
  padding: 0 30rpx;
  background-color: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  display: flex;
  align-items: center;
  height: 56rpx;
  padding: 0 20rpx;
  margin-right: 30rpx;
  border-radius: 28rpx;
  border: 2rpx solid #ddd;
  transition: all 0.3s ease;
}

.back-btn:active {
  border-color: #999;
  background-color: #f9f9f9;
}

.icon {
  fill: #666;
  margin-right: 4rpx;
}

.back-text {
  font-size: 26rpx;
  color: #666;
}

.timer {
  font-size: 28rpx;
  color: #ff4d4f;
  font-weight: bold;
  flex: 1;
  text-align: center;
}

.swiper {
  height: 100%;
}

.swiper-item {
  height: 100%;
  padding: 30rpx;
  box-sizing: border-box;
  overflow-y: auto;
}

.question-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  /* 减小内距 */
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.question-title {
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  /* 各元素之间的间距 */
}

.question-index {
  font-size: 26rpx;
  color: #999;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.question-type {
  font-size: 24rpx;
  color: #1890ff;
  background: #e6f7ff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.question-score {
  font-size: 24rpx;
  color: #ff4d4f;
  background: #fff1f0;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  font-weight: 500;
}

.question-content {
  font-size: 30rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: 24rpx;
  font-weight: 500;
}

.question-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 20rpx auto;
  border-radius: 8rpx;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  /* 减小选项间距 */
}

.option-item {
  padding: 16rpx 24rpx;
  background-color: #f8f9fa;
  border-radius: 6rpx;
  border: 1rpx solid transparent;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.option-item.active {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}

.option-prefix {
  flex-shrink: 0;
  width: 48rpx;
  height: 48rpx;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-text {
  flex: 1;
  font-size: 28rpx;
  line-height: 1.4;
}

.option-text img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 10rpx auto;
  border-radius: 8rpx;
}

.exam-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16rpx 24rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
  /* 适配底部安全区域 */
  padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.center-btns {
  display: flex;
  gap: 12rpx;
}

.nav-btn {
  padding: 12rpx 24rpx;
  color: #666;
  font-size: 26rpx;
}

.nav-btn.disabled {
  opacity: 0.5;
}

.submit-btn {
  padding: 12rpx 32rpx;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-radius: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
}

.submit-btn text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.2);
  background: linear-gradient(135deg, #096dd9 0%, #0050b3 100%);
}

.explanation-section {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border-left: 8rpx solid #1890ff;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.explanation-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.answer-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1890ff;
  position: relative;
  padding-left: 24rpx;
}

.answer-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8rpx;
  height: 24rpx;
  background: #1890ff;
  border-radius: 4rpx;
}

.explanation-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  padding: 16rpx;
  background: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.explanation-text {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #fff;
  border-radius: 8rpx;
}

.explanation-label {
  display: inline-block;
  color: #1890ff;
  font-weight: 500;
  margin-right: 8rpx;
  position: relative;
}

.answer-card-drawer {
  position: fixed;
  right: -80%;
  top: 0;
  width: 80%;
  height: 100vh;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: -4rpx 0 20rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 999;
}

.drawer-open {
  right: 0;
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.drawer-header {
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 新增滚动域样式 */
.question-grid-scroll {
  flex: 1;
  height: 0;
  /* 关键：让scroll-view填充余空间 */
}

.question-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx;
}

.question-item {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  margin: 10rpx;
  background: #fff;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #e8e8e8;
}

.question-number {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 4rpx;
}

.question-type-tag {
  font-size: 20rpx;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
  background: #f5f5f5;
  color: #666;
}

.status-icon {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  width: 32rpx;
  height: 32rpx;
  line-height: 32rpx;
  text-align: center;
  font-size: 20rpx;
  border-radius: 50%;
}

.question-item.current {
  border-color: #1890ff;
  background: #e6f7ff;
}

.question-item.answered {
  border-color: #52c41a;
  background: #f6ffed;
}

.question-item.wrong {
  border-color: #ff4d4f;
  background: #fff1f0;
}

/* 不同题型的标签样式 */
.question-item[data-type="single"] .question-type-tag {
  background: #e6f7ff;
  color: #1890ff;
}

.question-item[data-type="multiple"] .question-type-tag {
  background: #fff7e6;
  color: #fa8c16;
}

.question-item[data-type="blank"] .question-type-tag {
  background: #f9f0ff;
  color: #722ed1;
}

.question-item[data-type="essay"] .question-type-tag {
  background: #f6ffed;
  color: #52c41a;
}

@font-face {
  font-family: "iconfont";
  src: url("//at.alicdn.com/t/font_1234567_abcdef.woff2") format("woff2"),
    url("//at.alicdn.com/t/font_1234567_abcdef.woff") format("woff"),
    url("//at.alicdn.com/t/font_1234567_abcdef.ttf") format("truetype");
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 32rpx;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-arrow-left:before {
  content: "\e6db";
  /* 里的编需要根据实际使用的图标库来修改 */
}

/* 添加新的样式 */
.question-type {
  margin-left: 20rpx;
  font-size: 24rpx;
  color: #1890ff;
  background: #e6f7ff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.options.multiple .option-prefix.checkbox {
  border-radius: 4rpx;
}

.blank-input {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.essay-input {
  width: 100%;
  min-height: 300rpx;
  padding: 20rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

/* 添加或修改样式 */
.blank-content {
  margin: 20rpx 0;
  line-height: 2;
  font-size: 30rpx;
  color: #333;
}

.blank-text {
  word-wrap: break-word;
  white-space: pre-wrap;
}

.blank-wrapper {
  display: inline-flex;
  align-items: center;
  margin: 0 8rpx;
  vertical-align: middle;
}

.blank-input {
  width: 200rpx;
  /* 固定度 */
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 20rpx;
  border: none;
  border-bottom: 2rpx solid #ddd;
  text-align: center;
  font-size: 28rpx;
  color: #333;
  background: #f8f9fa;
  border-radius: 4rpx;
}

.blank-input:focus {
  border-bottom-color: #1890ff;
  background: #fff;
}

/* 论述题样式优化 */
.essay-container {
  margin-top: 10rpx;
  background-color: #fff;
  border-radius: 12rpx;
  padding: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.essay-input {
  width: 100%;
  min-height: 400rpx;
  padding: 24rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  line-height: 1.8;
  color: #333;
  background-color: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 8rpx;
  transition: all 0.3s ease;
}

.essay-input:focus {
  background-color: #fff;
  border-color: #1890ff;
  box-shadow: 0 0 0 2rpx rgba(24, 144, 255, 0.1);
}

.essay-input::placeholder {
  color: #adb5bd;
  font-size: 28rpx;
}

.essay-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
  padding: 0 12rpx;
}

.word-count {
  font-size: 24rpx;
  color: #909399;
}

.tip {
  font-size: 24rpx;
  color: #f56c6c;
}

/* 当字数超限时的样式 */
.essay-container.overflow .word-count {
  color: #f56c6c;
}

/* 适配暗黑模式 */
@media (prefers-color-scheme: dark) {
  .essay-input {
    background-color: #2c2c2c;
    border-color: #3a3a3a;
    color: #e0e0e0;
  }

  .essay-input:focus {
    background-color: #333;
    border-color: #1890ff;
  }

  .essay-input::placeholder {
    color: #666;
  }
}

/* 配底部安全区域 */
.question-grid {
  padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.handle-area {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 998;
}

.drawer-handle {
  width: 80rpx;
  height: 180rpx;
  background: #1890ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  pointer-events: auto;
  box-shadow: -2rpx 0 10rpx rgba(0, 0, 0, 0.1);
  border-radius: v-bind('isOnLeft ? "0 16rpx 16rpx 0" : "16rpx 0 0 16rpx"');
  will-change: transform; /* 优化性能 */
}

.handle-text {
  writing-mode: vertical-lr;
  text-orientation: upright;
  letter-spacing: 8rpx;
  font-weight: 500;
  user-select: none; /* 止文字选中 */
}

/* 添加待批改状态的样式 */
.question-item.pending {
  border-color: #faad14;
  background: #fffbe6;
}

.question-item.pending .status-icon {
  background: #faad14;
  color: #fff;
}

.question-item.unanswered {
  border-color: #e8e8e8;
  background: #fff;
}

.question-item.answered {
  border-color: #1890ff;
  background: #e6f7ff;
}

.question-item.correct {
  border-color: #52c41a;
  background: #f6ffed;
}

.question-item.wrong {
  border-color: #ff4d4f;
  background: #fff1f0;
}

.question-item.pending {
  border-color: #faad14;
  background: #fffbe6;
}

.option-item.correct-option {
  background-color: #f6ffed;
  border-color: #52c41a;
}

.option-item.wrong-option {
  background-color: #fff1f0;
  border-color: #ff4d4f;
}

.option-item.active.correct-option {
  background-color: #f6ffed;
  border-color: #52c41a;
}

/* 添加新样式 */
.view-answer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 32rpx;
  background: #fff;
  border: 2rpx solid #1890ff;
  border-radius: 32rpx;
  color: #1890ff;
  font-size: 26rpx;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.view-answer-btn::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: rgba(24, 144, 255, 0.1);
  border-radius: 32rpx;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.3s ease;
}

.view-answer-btn:active::after {
  transform: translate(-50%, -50%) scale(1);
}

.view-answer-btn.active {
  background: #1890ff;
  color: #fff;
}

.btn-icon {
  display: inline-block;
  font-size: 24rpx;
  font-weight: bold;
  width: 32rpx;
  height: 32rpx;
  line-height: 32rpx;
  text-align: center;
  border-radius: 50%;
  color: #fff;
  background: #1890ff;
}

.btn-icon.active {
  background: #fff;
  color: #1890ff;
}

.btn-text {
  font-weight: 500;
  letter-spacing: 1rpx;
}

/* 添新按钮样式 */
.submit-answer-btn {
  padding: 16rpx 32rpx;
  background: #52c41a;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.3);
  transition: all 0.3s ease;
}

.submit-answer-btn text {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.submit-answer-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(82, 196, 26, 0.2);
  background: #389e0d;
}

/* 答题显示区域样式 */
.answer-section {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border-left: 8rpx solid #1890ff;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-section {
  margin-bottom: 20rpx;
}

.result-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.blank-answer {
  margin-top: 12rpx;
  padding: 12rpx 20rpx;
  background: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #1890ff;
}

.essay-answer {
  margin-top: 12rpx;
  padding: 20rpx;
  background: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
}

.explanation-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #eee;
}

.explanation-title {
  font-size: 28rpx;
  color: #1890ff;
  font-weight: 500;
  margin-bottom: 12rpx;
  display: block;
}

.explanation-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

/* 修改解析部分式 */
.explanation-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #eee;
}

/* 填空题解析不需要上边框 */
.explanation-section.no-border {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.explanation-title {
  font-size: 28rpx;
  color: #1890ff;
  font-weight: 500;
  margin-bottom: 12rpx;
  display: block;
}

.explanation-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

/* 优化答案显示区域样式 */
.explanation-section {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border-left: 8rpx solid #1890ff;
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.result-text {
  font-size: 28rpx;
  font-weight: 500;
}

.result-text.correct {
  color: #52c41a;
}

.result-text.wrong {
  color: #ff4d4f;
}

.correct-answer {
  font-size: 28rpx;
  color: #1890ff;
}

/* 优化按钮样式 */
.center-btns {
  display: flex;
  gap: 16rpx;
}

/* 统答案显示域样式 */
.explanation-section {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border-left: 8rpx solid #1890ff;
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.result-text {
  font-size: 28rpx;
  font-weight: 500;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.result-text.correct {
  color: #52c41a;
  background: #f6ffed;
}

.result-text.wrong {
  color: #ff4d4f;
  background: #fff1f0;
}

.result-text.reference {
  color: #1890ff;
  background: #e6f7ff;
}

.correct-answer {
  font-size: 28rpx;
  color: #1890ff;
  background: #e6f7ff;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.answer-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  padding: 16rpx;
  background: #fff;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}

.explanation-divider {
  height: 2rpx;
  background: #eee;
  margin: 16rpx 0;
}

.explanation-content {
  margin-top: 16rpx;
}

.explanation-label {
  display: inline-block;
  font-size: 28rpx;
  color: #1890ff;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.explanation-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  padding: 16rpx;
  background: #fff;
  border-radius: 8rpx;
}

/* 添加图片hover效果 */
.preview-image {
  cursor: zoom-in !important;
  transition: opacity 0.3s ease;
}

.preview-image:hover {
  opacity: 0.8;
}

/* 确保图片在移动端有触摸反馈 */
@media (hover: none) {
  .preview-image:active {
    opacity: 0.8;
  }
}

/* 确保图片样式正确应用 */
.question-content img,
.option-text img {
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
  margin: 10rpx 0 !important;
  border-radius: 8rpx !important;
}

/* 保图片可点击的样式 */
.preview-image {
  cursor: pointer !important;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

/* APP端特殊处理 */
/* #ifdef APP-PLUS */
.preview-image {
  pointer-events: auto !important;
}
/* #endif */

/* 确保rich-text内的图片样式正确 */
:deep(.rich-text-content img) {
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
  margin: 10rpx 0 !important;
  cursor: pointer !important;
}

/* 添加触摸反馈效果 */
:deep(.rich-text-content img:active) {
  opacity: 0.8;
}

/* 添加图片预览相关样式 */
.image-preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn {
  position: fixed;
  top: 30rpx;
  right: 30rpx;
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 60rpx;
  border-radius: 50%;
  z-index: 100000;
}

.preview-image {
  flex: 1;
  width: 100% !important;
  height: 100% !important;
}

/* 添加点击效果 */
.close-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.4);
}

.nav-btn-back {
  position: fixed;
  top: 30rpx;
  right: 30rpx;
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  cursor: pointer;
}

.nav-btn-back .uni-btn-icon {
  color: #fff;
  font-size: 48rpx;
  font-weight: bold;
}

.nav-btn-back:active {
  opacity: 0.8;
  transform: scale(0.95);
}
</style>
