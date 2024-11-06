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
      <view class="timer"> 剩余时间: {{ formatTime }} </view>
    </view>

    <!-- 题目区域 -->
    <view class="exam-content">
      <swiper class="swiper" :current="currentQuestion" @change="handlePageChange">
        <swiper-item
          v-for="(question, index) in questions"
          :key="index"
          class="swiper-item"
        >
          <view class="question-card">
            <view class="question-title">
              <text class="question-index">{{ index + 1 }}/{{ questions.length }}</text>
              <text class="question-type">{{ getQuestionTypeLabel(question.type) }}</text>
              <text class="question-score">{{ question.score }}分</text>
            </view>
            <view class="question-content">{{ question.content }}</view>
            <view class="options" :class="question.type">
              <!-- 单选题 -->
              <template v-if="question.type === 'single'">
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
                  <view class="option-text">{{ option.text }}</view>
                </view>
              </template>

              <!-- 多选题 -->
              <template v-else-if="question.type === 'multiple'">
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
                  <view class="option-text">{{ option.text }}</view>
                </view>
              </template>

              <!-- 填空题 -->
              <template v-else-if="question.type === 'blank'">
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
              <template v-else-if="question.type === 'essay'">
                <view class="essay-container">
                  <textarea
                    class="essay-input"
                    v-model="answers[index]"
                    :placeholder="question.placeholder || '请输入你的答案...'"
                    :maxlength="question.maxLength || 1000"
                    auto-height
                    @input="updateEssayAnswer(index, $event)"
                  >
                  </textarea>
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
            <!-- 答案解析部分 -->
            <template v-if="isBlankQuestion(question.type) || question.type === 'essay'">
              <view
                v-if="showingAnswer && currentQuestion === index"
                class="explanation-section"
              >
                <view class="explanation-header">
                  <text class="answer-title">参考答案</text>
                </view>
                <!-- 只在有内容时显示 -->
                <view
                  v-if="question.correct && question.correct.trim()"
                  class="explanation-content"
                >
                  {{ question.correct.trim() }}
                </view>
                <view
                  v-if="question.explanation && question.explanation.trim()"
                  class="explanation-text"
                >
                  <text class="explanation-label">解析：</text>
                  {{ question.explanation.trim() }}
                </view>
              </view>
            </template>

            <!-- 其他题型的显示逻辑 -->
            <template v-else>
              <view v-if="shouldShowExplanation(index)" class="explanation-section">
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
                <view v-if="question.explanation" class="explanation-content">
                  {{ question.explanation }}
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

        <!-- 添加查看答案按钮 -->
        <view
          v-if="shouldShowViewAnswerButton"
          class="view-answer-btn"
          :class="{ active: showingAnswer }"
          @click="toggleAnswerView"
        >
          <text class="btn-icon" :class="{ active: showingAnswer }">{{
            showingAnswer ? "✕" : "?"
          }}</text>
          <text class="btn-text">{{ showingAnswer ? "隐藏答案" : "查看答案" }}</text>
        </view>

        <view class="submit-btn" @click="submitExam">
          <text>提交</text>
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

    <!-- 答题卡抽屉 -->
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
          @change="onHandleMove"
          @touchend="onHandleTouchEnd"
          @click.stop="toggleAnswerCard"
        >
          <text class="handle-text">答题卡</text>
        </movable-view>
      </movable-area>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      optionLabels: ["A", "B", "C", "D", "E", "F", "G", "H"],
      questions: [], // 将从外部接收数
      answers: [],
      remainingTime: 3600,
      currentQuestion: 0,
      showAnswerCard: false,
      handleX: uni.getSystemInfoSync().windowWidth - 80, // 初始位置靠右
      handleY: 200,
      screenWidth: 0,
      screenHeight: 0,
      showingAnswer: false, // 添加新的数据属性
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
      const minutes = Math.floor(this.remainingTime / 60);
      const seconds = this.remainingTime % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    },
    answeredCount() {
      return this.answers.filter((answer) => answer).length;
    },
    shouldShowViewAnswerButton() {
      const currentQuestion = this.questions[this.currentQuestion];
      return (
        currentQuestion &&
        (this.isBlankQuestion(currentQuestion.type) || currentQuestion.type === "essay")
      );
    },
  },

  methods: {
    getQuestionTypeLabel(type) {
      const types = {
        single: "单选",
        multiple: "多选",
        blank: "填空",
        essay: "简答",
      };
      return types[type] || "未知";
    },

    selectAnswer(questionIndex, value) {
      const question = this.questions[questionIndex];
      if (question.type === "single") {
        this.$set(this.answers, questionIndex, value);

        // 检查是否答对，如果答对且不是最后一题则自动跳转下一题
        if (value === question.correct && questionIndex < this.questions.length - 1) {
          // 延迟跳转，让用户看到正确答案的反馈
          setTimeout(() => {
            this.currentQuestion++;
          }, 500); // 500ms 后跳转
        }
      }
    },

    toggleMultipleChoice(questionIndex, value) {
      const currentAnswers = this.answers[questionIndex] || [];
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((v) => v !== value)
        : [...currentAnswers, value];
      this.$set(this.answers, questionIndex, newAnswers);

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

    updateEssayAnswer(index, event) {
      const value = event.detail.value || event.target.value;
      this.$set(this.answers, index, value);
    },

    submitExam() {
      // 这里添加提交逻辑
      console.log("提交的答案：", this.answers);
    },
    handlePageChange(e) {
      this.currentQuestion = e.detail.current;
      this.showingAnswer = false; // 切换题目时重置答案显示状态
    },

    prevQuestion() {
      if (this.currentQuestion > 0) {
        this.currentQuestion--;
      }
    },

    nextQuestion() {
      if (this.currentQuestion < this.questions.length - 1) {
        this.currentQuestion++;
      }
    },

    toggleAnswerCard(e) {
      e.stopPropagation();
      this.showAnswerCard = !this.showAnswerCard;
    },

    jumpToQuestion(index) {
      this.currentQuestion = index;
      this.showAnswerCard = false;
    },

    onHandleMove(e) {
      this.handleX = e.detail.x;
      this.handleY = e.detail.y;
    },

    onHandleTouchEnd() {
      // 将rpx转换为px
      const handleWidth = uni.upx2px(80);
      const handleHeight = uni.upx2px(180);

      // 计算距离各边的距离
      const distanceToLeft = this.handleX;
      const distanceToRight = this.screenWidth - (this.handleX + handleWidth);

      // 水平吸附（只在左右两侧）
      if (distanceToLeft < distanceToRight) {
        this.handleX = 0; // 吸附到左边
      } else {
        this.handleX = this.screenWidth - handleWidth; // 吸附到右边
      }

      // 垂直位置限制
      if (this.handleY < 0) {
        this.handleY = 0;
      } else if (this.handleY > this.screenHeight - handleHeight) {
        this.handleY = this.screenHeight - handleHeight;
      }

      // 保位置
      uni.setStorageSync("drawerHandlePosition", {
        x: this.handleX,
        y: this.handleY,
      });
    },

    // 初始化时加载保的位置（可选）
    initHandlePosition() {
      try {
        const savedPosition = uni.getStorageSync("drawerHandlePosition");
        if (savedPosition) {
          // 检查保存的位置是否有效
          if (this.isValidPosition(savedPosition)) {
            this.handleX = savedPosition.x;
            this.handleY = savedPosition.y;
          }
        }
      } catch (e) {
        console.error("Failed to load handle position:", e);
      }
    },

    isValidPosition(position) {
      const handleWidth = uni.upx2px(80);
      const handleHeight = uni.upx2px(180);

      return (
        position.x >= 0 &&
        position.x <= this.screenWidth - handleWidth &&
        position.y >= 0 &&
        position.y <= this.screenHeight - handleHeight
      );
    },

    onMainContainerClick() {
      if (this.showAnswerCard) {
        this.showAnswerCard = false;
      }
    },

    handleBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          // 如果返回失败（没有上一页），则跳转首页
          uni.reLaunch({
            url: "/pages/index/index",
          });
        },
      });
    },

    // 解析填空题内容，将文本和填空位置分开
    parseBlankContent(content) {
      const parts = [];
      let lastIndex = 0;
      let blankIndex = 0;

      // 匹配连的下划线（6个或）
      const blankRegex = /_{6,}/g;
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
      const answers = this.answers[questionIndex] || [];
      return answers[blankIndex] || "";
    },

    // 检查填空题答案是否正确
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

    // 解析填空题内容将下划线等转换为输入框
    parseBlankContent(content) {
      const parts = [];
      let lastIndex = 0;
      let blankIndex = 0;

      // 处理多种可能的填空格式
      const blankRegex = /_{2,}|\[.*?\]|（\s*）/g;
      let match;

      while ((match = blankRegex.exec(content)) !== null) {
        // 添加填空前的文本
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

    // 转换选项格式
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

    // 检查答案是否正确
    checkAnswer(question, userAnswer) {
      // 如果没有答案，直接返回 null
      if (!userAnswer) return null;

      switch (question.type) {
        case "blank":
          // 填空题未完成时返回 null
          if (!this.isBlankAnswerComplete(userAnswer)) {
            return null;
          }
          // TODO: 实际的填空题答案比对逻辑
          // console.log("填空题答案比对逻辑");
          return null; // 暂时返回 null，不显示对错

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

      // 遍历所有答案进行判断
      for (let i = 0; i < this.questions.length; i++) {
        const question = this.questions[i];
        const answer = this.answers[i];

        if (question.type === "essay") {
          // TODO: 调用后端接口提交简答题/论述题答案
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

    // 更新答题卡显示状态
    updateQuestionStatus(index) {
      const question = this.questions[index];
      const answer = this.answers[index];

      // 没有答案时显示未
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

    // 获取状态图标
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

      // 填空题特殊处理：必须完全填写才显示解析
      if (this.isBlankQuestion(question.type)) {
        return this.isBlankAnswerComplete(answer);
      }

      // 简答题不显示解析
      if (question.type === "essay") return false;

      return true;
    },

    // 判断是为填空题
    isBlankQuestion(type) {
      return type === "blank";
    },

    // 修改方法：检查填空题答案是否有效（需要处理答案数组不存在的情况）
    hasValidBlankAnswer(answer) {
      // 检查 answer 是否存在且是数组
      if (!answer || !Array.isArray(answer)) return false;

      // 检查是否所有空都已填写且不是空字符串
      return (
        answer.length > 0 &&
        answer.every((item) => {
          // 检查每个答案是否存在且不是纯空格
          return item !== undefined && item !== null && item.trim().length > 0;
        })
      );
    },

    // 新增：检查多选题答案是否完全正确
    checkMultipleAnswer(userAnswer, correctAnswer) {
      if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) return false;
      if (userAnswer.length !== correctAnswer.length) return false;

      // 排序后比较，确保选择顺序不影响结果
      const sortedUser = [...userAnswer].sort();
      const sortedCorrect = [...correctAnswer].sort();
      return sortedUser.every((value, index) => value === sortedCorrect[index]);
    },

    // 添加新方法
    ensureHandlePosition() {
      const systemInfo = uni.getSystemInfoSync();
      this.screenWidth = systemInfo.windowWidth;
      this.screenHeight = systemInfo.windowHeight;

      // 强制执行吸附
      this.handleX = this.screenWidth - uni.upx2px(80);
      this.handleY = 200;
      this.onHandleTouchEnd();
    },

    // 添加新方法
    toggleAnswerView() {
      this.showingAnswer = !this.showingAnswer;
    },
  },

  mounted() {
    this.timer = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
      } else {
        clearInterval(this.timer);
        this.submitExam();
      }
    }, 1000);

    // 首次执行
    this.$nextTick(() => {
      this.initHandlePosition();

      // 添加延迟检查
      setTimeout(() => {
        // 检查位置是否正确，如果不在边缘则强制吸附
        const handleWidth = uni.upx2px(80);
        if (
          Math.abs(this.handleX) > 1 &&
          Math.abs(this.handleX - (this.screenWidth - handleWidth)) > 1
        ) {
          this.ensureHandlePosition();
        }
      }, 300);
    });
  },

  beforeDestroy() {
    clearInterval(this.timer);
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
  padding-top: 60rpx; /* 减顶部间距 */
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
  padding: 24rpx; /* 减小内距 */
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.question-title {
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  gap: 16rpx; /* 各元素之间的间距 */
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
  font-size: 30rpx; /* 稍微减小字号 */
  color: #333;
  line-height: 1.5;
  margin-bottom: 24rpx;
  font-weight: 500; /* 加粗题目文字 */
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12rpx; /* 减小选项间距 */
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

.exam-footer {
  padding: 16rpx 24rpx;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
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
  padding: 16rpx 48rpx;
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

/* 点击效果 */
.submit-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.2);
  background: linear-gradient(135deg, #096dd9 0%, #0050b3 100%);
}

/* 禁用状态 */
.submit-btn.disabled {
  background: #d9d9d9;
  box-shadow: none;
  cursor: not-allowed;
}

.submit-btn.disabled text {
  color: #999;
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
  border-bottom: 1rpx solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 新增滚动区域样式 */
.question-grid-scroll {
  flex: 1;
  height: 0; /* 关键：让scroll-view填充剩余空间 */
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
  content: "\e6db"; /* 里的编码需要根据实际使用的图标库来修改 */
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
  width: 200rpx; /* 固定度 */
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

/* 当字数超出限时的样式 */
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

/* 适配底部安全区域 */
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
  border-radius: v-bind('handleX === 0 ? "0 16rpx 16rpx 0" : "16rpx 0 0 16rpx"');
}

.handle-text {
  writing-mode: vertical-lr;
  text-orientation: upright;
  letter-spacing: 8rpx;
  font-weight: 500;
  transform: v-bind('handleX === 0 ? "rotate(180deg)" : "none"');
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
  margin: 0 16rpx;
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
</style>
