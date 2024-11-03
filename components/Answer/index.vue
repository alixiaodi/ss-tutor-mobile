<template>
  <view class="mock-exam-container" @click="onMainContainerClick">
    <!-- 固定的头部计时器 -->
    <view class="exam-header">
      <!-- #ifdef H5 -->
      <view class="back-btn" @click="handleBack">
        <svg t="1730634015516" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9822" width="16" height="16"><path d="M475 276V141.4c-12.1-56.3-58.2-22-58.2-22L96.6 395.9c-70.4 48.9-4.8 85.7-4.8 85.7l315.4 274.1c63.1 46.5 67.9-24.5 67.9-24.5V606.4C795.3 506 926.3 907.5 926.3 907.5c12.1 22 19.4 0 19.4 0C1069.4 305.4 475 276 475 276z" fill="#383838" p-id="9823"></path></svg>
        <text class="back-text">首页</text>
      </view>
      <!-- #endif -->
      <view class="timer">
        剩余时间: {{ formatTime }}
      </view>
    </view>

    <!-- 题目区域 -->
    <view class="exam-content">
      <swiper class="swiper" 
              :current="currentQuestion" 
              @change="handlePageChange">
        <swiper-item v-for="(question, index) in questions" 
                     :key="index" 
                     class="swiper-item">
          <view class="question-card">
            <view class="question-title">
              <text class="question-index">{{ index + 1 }}/{{ questions.length }}</text>
            </view>
            <view class="question-content">{{ question.content }}</view>
            <view class="options">
              <view v-for="(option, optIndex) in question.options" 
                    :key="option.value" 
                    class="option-item"
                    :class="{ 'active': answers[index] === option.value }"
                    @click="selectAnswer(index, option.value)">
                <view class="option-prefix">{{ optionLabels[optIndex] }}</view>
                <view class="option-text">{{ option.text }}</view>
              </view>
            </view>
            <!-- 新增答案解释部分 -->
            <view v-if="answers[index]" class="explanation-section">
              <view class="explanation-header">
                <text class="result-text" :class="answers[index] === question.correct ? 'correct' : 'wrong'">
                  {{ answers[index] === question.correct ? '回答正确' : '回答错误' }}
                </text>
                <text class="correct-answer">正确答案: {{ question.correct }}</text>
              </view>
              <view class="explanation-content">
                {{ question.explanation }}
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>

      <view class="exam-footer" @click.stop>
        <view class="nav-btn" @click="prevQuestion" :class="{ 'disabled': currentQuestion === 0 }">
          <text>上一题</text>
        </view>
        <view class="submit-btn" @click="submitExam">
          <text>提交</text>
        </view>
        <view class="nav-btn" @click="nextQuestion" :class="{ 'disabled': currentQuestion === questions.length - 1 }">
          <text>下一题</text>
        </view>
      </view>
    </view>

    <!-- 答题卡抽屉 -->
    <view class="answer-card-drawer" 
          :class="{ 'drawer-open': showAnswerCard }">
      <view class="drawer-content" @click.stop>
        <view class="drawer-header">
          <text>答题卡</text>
          <text class="answered-count">已答 {{ answeredCount }}/{{ questions.length }}</text>
        </view>
        <view class="question-grid">
          <view v-for="(question, index) in questions" 
                :key="index"
                :class="[
                  'question-item',
                  {
                    'current': currentQuestion === index,
                    'answered': answers[index],
                    'correct': answers[index] === question.correct,
                    'wrong': answers[index] && answers[index] !== question.correct
                  }
                ]"
                @click="jumpToQuestion(index)">
            <text>{{ index + 1 }}</text>
            <text v-if="answers[index]" class="status-icon">
              {{ answers[index] === question.correct ? '✓' : '×' }}
            </text>
          </view>
        </view>
      </view>
      <movable-area class="handle-area">
        <movable-view class="drawer-handle" 
                      direction="all"
                      :x="handleX"
                      :y="handleY"
                      @change="onHandleMove"
                      @touchend="onHandleTouchEnd"
                      @click.stop="toggleAnswerCard">
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
      optionLabels: ['A', 'B', 'C', 'D', 'E'],
      questions: [
        {
          content: '以下哪个是JavaScript的基本数据类型？',
          options: [
            { value: 'A', text: 'String' },
            { value: 'B', text: 'Array' },
            { value: 'C', text: 'Object' },
            { value: 'D', text: 'Function' }
          ],
          correct: 'A',
          explanation: 'String 是 JavaScript 的基本数据类型之一。Array、Object 和 Function 都是引用类型（对象类型），而不是基本数据类型。JavaScript 的基本数据类型包括：String、Number、Boolean、Null、Undefined、Symbol 和 BigInt。'
        },
        // 示例第二题
        {
          content: '在Vue中，哪个生命周期钩子会在组件挂载到DOM后被调用？',
          options: [
            { value: 'A', text: 'created' },
            { value: 'B', text: 'mounted' },
            { value: 'C', text: 'beforeCreate' },
            { value: 'D', text: 'beforeMount' }
          ],
          correct: 'B',
          explanation: 'mounted 是 Vue 组件生命周期中的一个钩子函数，它在组件挂载 DOM 后被调用。'
        }
      ],
      answers: [],
      remainingTime: 3600,
      currentQuestion: 0,
      showAnswerCard: false,
      handleX: 0,
      handleY: 200,
      screenWidth: 0,
      screenHeight: 0,
    }
  },

  computed: {
    formatTime() {
      const minutes = Math.floor(this.remainingTime / 60)
      const seconds = this.remainingTime % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },
    answeredCount() {
      return this.answers.filter(answer => answer).length
    }
  },

  methods: {
    selectAnswer(questionIndex, value) {
      this.$set(this.answers, questionIndex, value)
    },
    submitExam() {
      // 这里添加提交逻辑
      console.log('提交的答案：', this.answers)
    },
    handlePageChange(e) {
      this.currentQuestion = e.detail.current
    },
    
    prevQuestion() {
      if (this.currentQuestion > 0) {
        this.currentQuestion--
      }
    },
    
    nextQuestion() {
      if (this.currentQuestion < this.questions.length - 1) {
        this.currentQuestion++
      }
    },

    toggleAnswerCard(e) {
      e.stopPropagation()
      this.showAnswerCard = !this.showAnswerCard
    },

    jumpToQuestion(index) {
      this.currentQuestion = index
      this.showAnswerCard = false
    },

    onHandleMove(e) {
      this.handleX = e.detail.x
      this.handleY = e.detail.y
    },

    onHandleTouchEnd() {
      // 转换 rpx 为 px
      const handleWidth = uni.upx2px(80)
      const handleHeight = uni.upx2px(180)
      
      // 计算距离各边的距离
      const distanceToLeft = this.handleX
      const distanceToRight = this.screenWidth - (this.handleX + handleWidth)
      const distanceToTop = this.handleY
      const distanceToBottom = this.screenHeight - (this.handleY + handleHeight)

      // 找出最小距离
      const minDistance = Math.min(
        distanceToLeft,
        distanceToRight,
        distanceToTop,
        distanceToBottom
      )

      // 根据最小距离决定吸附位置
      switch (minDistance) {
        case distanceToLeft:
          this.handleX = 0
          break
        case distanceToRight:
          this.handleX = this.screenWidth - handleWidth
          break
        case distanceToTop:
          this.handleY = 0
          break
        case distanceToBottom:
          this.handleY = this.screenHeight - handleHeight
          break
      }

      // 保存位置到本地存储（可选）
      uni.setStorageSync('drawerHandlePosition', {
        x: this.handleX,
        y: this.handleY
      })
    },

    // 初始化时加载保的位置（可选）
    initHandlePosition() {
      const savedPosition = uni.getStorageSync('drawerHandlePosition')
      if (savedPosition) {
        this.handleX = savedPosition.x
        this.handleY = savedPosition.y
      }
    },

    onMainContainerClick() {
      if (this.showAnswerCard) {
        this.showAnswerCard = false
      }
    },

    handleBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          // 如果返回失败（没有上一页），则跳转到首页
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }
      })
    }
  },

  mounted() {
    this.timer = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--
      } else {
        clearInterval(this.timer)
        this.submitExam()
      }
    }, 1000)

    // 获取屏幕尺寸
    const systemInfo = uni.getSystemInfoSync()
    this.screenWidth = systemInfo.windowWidth
    this.screenHeight = systemInfo.windowHeight
  },

  beforeDestroy() {
    clearInterval(this.timer)
  }
}
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
  padding-top: 80rpx; /* 为固定的头部留出空间 */
  padding-bottom: 120rpx; /* 为底部导航留空间 */
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
  border-radius: 16rpx;
  padding: 30rpx;
  box-sizing: border-box;
}

.question-title {
  margin-bottom: 30rpx;
}

.question-index {
  font-size: 28rpx;
  color: #666;
}

.question-content {
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 40rpx;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  background-color: #f5f7fa;
  border-radius: 8rpx;
  transition: all 0.3s;
}

.option-item.active {
  background-color: #e6f7ff;
  border: 2rpx solid #1890ff;
}

.option-prefix {
  width: 60rpx;
  height: 60rpx;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin-right: 20rpx;
  color: #666;
}

.active .option-prefix {
  background-color: #1890ff;
  color: #fff;
}

.option-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.exam-footer {
  padding: 20rpx 30rpx;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-btn {
  padding: 16rpx 30rpx;
  color: #666;
  font-size: 28rpx;
}

.nav-btn.disabled {
  opacity: 0.5;
}

.submit-btn {
  padding: 16rpx 60rpx;
  background-color: #1890ff;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.explanation-section {
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
}

.explanation-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.result-text {
  font-size: 28rpx;
  font-weight: bold;
  margin-right: 20rpx;
}

.result-text.correct {
  color: #52c41a;
}

.result-text.wrong {
  color: #ff4d4f;
}

.correct-answer {
  font-size: 28rpx;
  color: #666;
}

.explanation-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.answer-card-drawer {
  position: fixed;
  right: -520rpx;
  top: 80rpx;  /* 从header下方开始 */
  bottom: 120rpx;
  width: 520rpx;
  transition: all 0.3s ease;
  z-index: 99;
}

.drawer-open {
  right: 0;
  /* 添加一个右边距，避免内容被遮挡 */
  & + .exam-content {
    padding-right: 520rpx;
    transition: all 0.3s ease;
  }
}

.drawer-content {
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  box-shadow: -2rpx 0 10rpx rgba(0, 0, 0, 0.1);
  padding: 30rpx;
  box-sizing: border-box;
}

.handle-area {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 999;  /* 确保比header低 */
}

.drawer-handle {
  width: 80rpx;
  height: 180rpx;
  background-color: #1890ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  pointer-events: auto;
}

.handle-text {
  writing-mode: vertical-lr;
  font-size: 32rpx;
  line-height: 1.5;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  letter-spacing: 4rpx;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.answered-count {
  font-size: 28rpx;
  color: #666;
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
}

.question-item {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 8rpx;
  font-size: 28rpx;
  cursor: pointer;
}

.question-item.current {
  border: 2rpx solid #1890ff;
}

.question-item.answered {
  background-color: #e6f7ff;
}

.question-item.correct {
  background-color: #52c41a;
  color: #fff;
  border: none;
}

.question-item.wrong {
  background-color: #ff4d4f;
  color: #fff;
  border: none;
}

.status-icon {
  position: absolute;
  right: 8rpx;
  top: 8rpx;
  font-size: 24rpx;
  font-weight: bold;
}

@font-face {
  font-family: "iconfont";
  src: url('//at.alicdn.com/t/font_1234567_abcdef.woff2') format('woff2'),
       url('//at.alicdn.com/t/font_1234567_abcdef.woff') format('woff'),
       url('//at.alicdn.com/t/font_1234567_abcdef.ttf') format('truetype');
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 32rpx;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-arrow-left:before {
  content: "\e6db";  /* 这里的编码需要根据你实际使用的图标库来修改 */
}
</style> 