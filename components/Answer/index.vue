<template>
  <view class="mock-exam-container" @click="onMainContainerClick">
    <!-- 固定的头部计时器 -->
    <view class="exam-header">
      <!-- #ifdef H5 -->
      <view class="back-btn" @click="handleBack" v-if="mode !== '5'">
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
        <view class="icon-text-wrapper">
          <svg
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
          >
            <path
              d="M512 0C229.376 0 0 229.376 0 512s229.376 512 512 512 512-229.376 512-512S794.624 0 512 0z m281.6 407.552L480.256 720.896c-12.288 12.288-32.768 12.288-45.056 0L268.288 553.984c-12.288-12.288-12.288-32.768 0-45.056 12.288-12.288 32.768-12.288 45.056 0l144.384 144.384 290.816-290.816c12.288-12.288 32.768-12.288 45.056 0 12.288 12.288 12.288 32.768 0 45.056z"
              fill="#FFFFFF"
            ></path>
          </svg>
          <text>{{ mode === "5" ? "保存" : "提交" }}</text>
        </view>
      </view>
    </view>

    <!-- 区域 -->
    <view class="exam-content">
      <swiper class="swiper" :current="currentQuestion" @change="handlePageChange">
        <swiper-item
          v-for="(question, index) in questions"
          :key="index"
          class="swiper-item"
        >
          <!-- 添加scroll-view包裹内容 -->
          <scroll-view
            scroll-y
            class="question-scroll"
            :scroll-top="scrollTop"
            @scroll="handleScroll"
            :enhanced="true"
            :bounces="true"
            :show-scrollbar="true"
            :scroll-with-animation="true"
          >
            <view class="question-card" v-if="question">
              <view class="question-title">
                <text class="question-index">{{ index + 1 }}/{{ questions.length }}</text>
                <text class="question-type">{{
                  getQuestionTypeLabel(question.type)
                }}</text>
                <text class="question-score">{{ question.score }}分</text>
              </view>
              <!-- 修改这里：只在非填空题时显示question-content -->
              <view class="question-content" v-if="question.type !== 'blank'">
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
                      'correct-option':
                        answers[index] && option.value === question.correct,
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
                    <view class="option-prefix checkbox">{{
                      optionLabels[optIndex]
                    }}</view>
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

              <!-- 完成作答按钮 -->
              <template v-if="question.type === 'blank' || question.type === 'essay'">
                <view class="submit-answer-section" v-if="!showingAnswer">
                  <view class="submit-answer-btn" @click="submitCurrentAnswer">
                    <text>完成作答</text>
                  </view>
                </view>
              </template>

              <!-- 答案解析部 -->
              <template v-if="question">
                <view
                  v-if="showingAnswer && currentQuestion === index"
                  class="explanation-section"
                >
                  <view class="explanation-header">
                    <!-- 单选和多选题显示对错 -->
                    <template v-if="['single', 'multiple'].includes(question.type)">
                      <text
                        :class="[
                          'result-text',
                          checkAnswer(question, answers[index]) ? 'correct' : 'wrong',
                        ]"
                      >
                        {{
                          checkAnswer(question, answers[index]) ? "回答正确" : "回答错误"
                        }}
                      </text>
                      <text
                        v-if="!checkAnswer(question, answers[index])"
                        class="correct-answer"
                      >
                        正确答案: {{ question.correct }}
                      </text>
                    </template>

                    <!-- 填空题显示正确答案 -->
                    <template v-else-if="question.type === 'blank'">
                      <text class="correct-answer">
                        正确答案: {{ question.correct }}
                      </text>
                    </template>

                    <!-- 简答题显示参考答案 -->
                    <template v-else-if="question.type === 'essay'">
                      <text class="result-text reference">参考答案</text>
                    </template>
                  </view>

                  <!-- 记忆方法按钮 - 所有题型都显示 -->
                  <view
                    class="memory-tip-btn"
                    @click="showMemoryTip(question.id)"
                    v-if="!showingMemoryTip[question.id]"
                  >
                    <image
                      class="crown-icon"
                      src="/static/img/crown.png"
                      mode="aspectFit"
                    ></image>
                    <text>查看记忆方法</text>
                  </view>

                  <!-- 记忆方法内容 -->
                  <view class="memory-tip-content" v-if="showingMemoryTip[question.id]">
                    <view class="memory-tip-header">
                      <image
                        class="crown-icon"
                        src="/static/img/crown.png"
                        mode="aspectFit"
                      ></image>
                      <text class="memory-tip-title">记忆方法</text>
                      <!-- 修改收藏按钮 -->
                      <view
                        class="collect-btn"
                        @click.stop="showCollectDialog(question.id)"
                      >
                        <text class="collect-icon">★</text>
                        <text class="collect-text">收藏</text>
                      </view>
                    </view>
                    <!-- 修改记忆方法内容展示 -->
                    <view class="memory-tip-text">
                      <rich-text :nodes="memoryTipContent[question.id]"></rich-text>
                    </view>
                  </view>

                  <!-- 题目解析 -->
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
          </scroll-view>
        </swiper-item>
      </swiper>

      <view class="exam-footer" @click.stop>
        <view class="nav-btn" @click="openAiChat">
          <svg
            class="nav-icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M512 85.333333c235.648 0 426.666667 191.018667 426.666667 426.666667s-191.018667 426.666667-426.666667 426.666667S85.333333 747.648 85.333333 512 276.352 85.333333 512 85.333333z m0 64c-200.298667 0-362.666667 162.368-362.666667 362.666667s162.368 362.666667 362.666667 362.666667 362.666667-162.368 362.666667-362.666667-162.368-362.666667-362.666667-362.666667z m-74.965333 254.698667L572.586667 512l-135.552 107.968a32 32 0 1 0 39.893333 50.074667l170.666667-136a32 32 0 0 0 0-50.074667l-170.666667-136a32 32 0 1 0-39.893333 50.074667z"
              fill="#1890ff"
            ></path>
          </svg>
          <text>AI助手</text>
        </view>

        <view class="nav-btn" @click="toggleAnswerView">
          <svg
            class="nav-icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M512 234.666667c176.725333 0 328.874667 102.912 401.365333 252.245333a32 32 0 0 1 0 28.181333C840.874667 664.426667 688.725333 767.36 512 767.36c-176.725333 0-328.874667-102.912-401.365333-252.266667a32 32 0 0 1 0-28.181333C183.125333 337.578667 335.274667 234.666667 512 234.666667z m0 64c-146.282667 0-275.093333 83.306667-338.346667 209.365333C236.906667 634.069333 365.717333 717.397333 512 717.397333c146.282667 0 275.093333-83.306667 338.346667-209.365333C787.093333 382.016 658.282667 298.666667 512 298.666667z m0 106.666666a106.666667 106.666667 0 1 1 0 213.333334 106.666667 106.666667 0 0 1 0-213.333334z m0 64a42.666667 42.666667 0 1 0 0 85.333334 42.666667 42.666667 0 0 0 0-85.333334z"
              fill="#1890ff"
            ></path>
          </svg>
          <text>{{ showingAnswer ? "隐藏答案" : "查看答案" }}</text>
        </view>

        <view class="nav-btn" @click="toggleAnswerCard">
          <svg
            class="nav-icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M810.666667 128H213.333333c-46.933333 0-85.333333 38.4-85.333333 85.333333v597.333334c0 46.933333 38.4 85.333333 85.333333 85.333333h597.333334c46.933333 0 85.333333-38.4 85.333333-85.333333V213.333333c0-46.933333-38.4-85.333333-85.333333-85.333333z m21.333333 682.666667c0 12.8-8.533333 21.333333-21.333333 21.333333H213.333333c-12.8 0-21.333333-8.533333-21.333333-21.333333V213.333333c0-12.8 8.533333-21.333333 21.333333-21.333333h597.333334c12.8 0 21.333333 8.533333 21.333333 21.333333v597.333334z"
              fill="#1890ff"
            ></path>
            <path
              d="M298.666667 298.666667h426.666666v64H298.666667zM298.666667 480h426.666666v64H298.666667zM298.666667 661.333333h213.333333v64H298.666667z"
              fill="#1890ff"
            ></path>
          </svg>
          <text>答题卡</text>
        </view>
      </view>
    </view>

    <!-- 添加首次使用提示 -->
    <view class="swipe-tip" v-if="showSwipeTip" @click="closeSwipeTip">
      <view class="tip-content" @click.stop>
        <!-- 添加手势图标和动画 -->
        <view class="gesture-animation">
          <view class="gesture-icon">
            <view class="arrow-left"></view>
            <view class="hand-icon">👆</view>
            <view class="arrow-right"></view>
          </view>
        </view>
        <!-- 提示文本 -->
        <view class="tip-text">
          <text>左右滑动，轻松切换题目</text>
          <text class="sub-text">体验更流畅的答题方式</text>
        </view>
        <!-- 进度条 -->
        <view class="progress-bar">
          <view class="progress" :style="{ width: progressWidth + '%' }"></view>
        </view>
        <!-- 不再提示选项 -->
        <view class="tip-options">
          <view class="no-more-tip" @click="disableTip">
            <text>不再提示</text>
          </view>
          <view class="confirm-btn" @click="closeSwipeTip">
            <text>我知道了</text>
          </view>
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
              <text class="question-type-tag">
                {{
                  question.type === "essay" &&
                  (question.originalType === "综合应用题" ||
                    question.originalType === "综合应用" ||
                    question.originalType === "综合分析题" ||
                    question.originalType === "综合分析")
                    ? question.originalType.replace("题", "")
                    : getQuestionTypeLabel(question.type, index)
                }}
              </text>
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

    <!-- 添加收藏选择弹窗 -->
    <view
      class="collect-dialog"
      v-if="showCollectSelect"
      @click.stop="closeCollectDialog"
    >
      <view class="collect-dialog-content" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">收藏内容</text>
          <text class="dialog-close" @click="closeCollectDialog">×</text>
        </view>

        <view class="collect-dialog-body">
          <!-- 左侧：内容选择区域 -->
          <view class="content-section">
            <view class="section-header">
              <text class="section-title">选择要收藏的内容</text>
              <text class="selected-count" v-if="selectedTexts.length">
                已选择 {{ selectedTexts.length }} 段
              </text>
            </view>

            <scroll-view scroll-y class="content-list">
              <view
                v-for="(paragraph, index) in parsedParagraphs"
                :key="index"
                class="content-item"
                :class="{ selected: selectedIndexes.includes(index) }"
                @click="toggleParagraphSelect(index, paragraph)"
              >
                <view class="item-header">
                  <view class="checkbox">
                    <text v-if="selectedIndexes.includes(index)" class="checkbox-icon"
                      >✓</text
                    >
                  </view>
                  <text class="item-type" v-if="paragraph.type"
                    >【{{ paragraph.type }}】</text
                  >
                </view>
                <!-- 修改内容展示部分 -->
                <view class="item-content">
                  <text class="item-type" v-if="paragraph.type"
                    >【{{ paragraph.type }}】</text
                  >
                  <text class="item-text" user-select>{{ paragraph.content }}</text>
                </view>
              </view>
            </scroll-view>
          </view>

          <!-- 右侧：分组选择区域 -->
          <view class="group-section">
            <view class="section-header">
              <text class="section-title">选择收藏分组</text>
              <text class="add-btn" @click="showAddGroup">新建分组</text>
            </view>

            <view class="search-box">
              <input
                class="search-input"
                v-model="searchGroupKeyword"
                placeholder="搜索分组"
                @input="onSearchInput"
              />
              <text v-if="searchGroupKeyword" class="clear-btn" @click="clearSearch"
                >×</text
              >
            </view>

            <scroll-view scroll-y class="group-list">
              <view
                v-for="group in filteredGroups"
                :key="group.id"
                class="group-item"
                :class="{ active: selectedGroupId === group.id }"
                @click="selectGroup(group.id)"
              >
                <text class="group-name">{{ group.name }}</text>
                <text class="group-count">{{ group.count || 0 }}</text>
              </view>
              <view v-if="filteredGroups.length === 0" class="empty-tip">
                未找到相关分组
              </view>
            </scroll-view>
          </view>
        </view>

        <view class="dialog-footer">
          <view class="btn cancel" @click="closeCollectDialog">取消</view>
          <view
            class="btn confirm"
            :class="{ disabled: !selectedGroupId || !selectedTexts.length }"
            @click="confirmCollect"
          >
            确定收藏
          </view>
        </view>
      </view>
    </view>

    <!-- 添加新建分组弹窗 -->
    <view class="add-group-dialog" v-if="showAddGroupDialog" @click.stop="closeAddGroup">
      <view class="add-group-content" @click.stop>
        <view class="add-group-header">
          <text class="add-group-title">新建分组</text>
          <text class="close-btn" @click="closeAddGroup">×</text>
        </view>
        <view class="add-group-body">
          <input
            class="group-name-input"
            v-model="newGroupName"
            placeholder="请输入分组名称"
            maxlength="20"
            @input="onGroupNameInput"
          />
          <text class="input-count">{{ newGroupName.length }}/20</text>
        </view>
        <view class="add-group-footer">
          <view class="dialog-btn cancel" @click="closeAddGroup">取消</view>
          <view
            class="dialog-btn confirm"
            :class="{ disabled: !newGroupName.trim() }"
            @click="createGroup"
          >
            确定
          </view>
        </view>
      </view>
    </view>

    <!-- 提交确认弹窗 -->
    <view class="custom-modal" v-if="showSubmitConfirm" @click="cancelSubmit" style="backdrop-filter: blur(8rpx);">
      <view
        class="modal-content"
        @click.stop
        style="border-radius: 24rpx; box-shadow: 0 28rpx 48rpx rgba(14, 30, 64, 0.22); overflow: hidden;"
      >
        <view class="modal-header" style="padding: 32rpx 32rpx 24rpx;">
          <view style="display: flex; align-items: center; justify-content: center; column-gap: 20rpx;">
            <view
              style="width: 72rpx; height: 72rpx; border-radius: 50%; background: rgba(24, 144, 255, 0.12); display: flex; align-items: center; justify-content: center;"
            >
              <text style="font-size: 40rpx; color: #1890ff; font-weight: 600;">!</text>
            </view>
            <view style="display: flex; flex-direction: column; row-gap: 6rpx; align-items: flex-start;">
              <text class="modal-title" style="font-size: 34rpx;">提示</text>
              <text style="font-size: 26rpx; color: #999;">提交后答题结果将无法更改</text>
            </view>
          </view>
        </view>
        <view class="modal-body" style="padding: 0 32rpx 32rpx;">
          <view
            style="background: #f7f9fc; border-radius: 18rpx; padding: 26rpx; color: #4c6079; line-height: 1.7;"
          >
            <rich-text :nodes="submitConfirmContent"></rich-text>
          </view>
        </view>
        <view class="modal-footer" style="padding: 0 32rpx 36rpx; column-gap: 20rpx; border-top: none;">
          <view
            class="btn cancel"
            @click="cancelSubmit"
            style="border: 1rpx solid #d9d9d9; border-radius: 14rpx; height: 88rpx; display: flex; align-items: center; justify-content: center; color: #4c6079; background: #fff;"
          >
            取消
          </view>
          <view
            class="btn confirm"
            @click="confirmSubmit"
            style="border-radius: 14rpx; height: 88rpx; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1890ff, #40a9ff); box-shadow: 0 14rpx 28rpx rgba(24, 144, 255, 0.35); color: #fff;"
          >
            确定
          </view>
        </view>
      </view>
    </view>
  </view>

</template>

<script>
import * as AiApi from "@/api/ai";
import * as AnswerQuestionsApi from "@/api/answerQuestions";
import * as CollectGroupApi from "@/api/collectGroup";
import * as CollectInfoApi from "@/api/collectInfo";
export default {
  props: {
    rawQuestions: {
      type: Array,
      default: () => [],
    },
    answerHistory: {
      type: Array,
      default: null,
    },
    answerId: {
      type: String,
      default: null,
    },
  },

  data() {
    const sysInfo = uni.getSystemInfoSync(); // 在 data 中获取系统信息
    const buttonWidthPx = uni.upx2px(100); // 转换按钮宽度为 px
    return {
      correctAudio: null,
      wrongAudio: null,
      optionLabels: ["A", "B", "C", "D", "E", "F", "G", "H"],
      questions: [], // 将从外部接收数
      answers: [],
      answerViewStates: [], // 新增：记录每道题的答案显示状态
      remainingTime: 3600,
      currentQuestion: 0,
      showAnswerCard: false,
      showingAnswer: false,
      isMoving: false, // 新增踪是正在移动
      previewImage: "", // 添加预览片的URL
      statusBarHeight: 0, // 添加状态栏高度
      id: null, // 题目ID
      mode: null, // 模式
      startTime: null, // 添加开始时间
      usedTime: 0, // 添加已用时间
      timer: null, // 添加计时器引用
      showingMemoryTip: {}, // 修改为对象，用于存储每个题目的记忆方法显示状态
      memoryTipContent: {}, // 修改为对象，用于存储每个题目的记忆方法内容
      scrollTop: 0,
      lastScrollTop: 0,
      isCollected: {}, // 新增：存储收藏状态
      showCollectSelect: false, // 是否显示收藏选择弹窗
      selectedTexts: [], // 改为数组，存储多段选中的文本
      selectedIndexes: [], // 存储选中段落的索引
      parsedParagraphs: [], // 存储解析后的段落
      currentQuestionId: null, // 当前操作的题目ID
      currentMemoryContent: "", // 修改为字符串，存储完整的HTML内容
      parsedMemoryItems: [], // 新增：存储解析后的可选择内容
      currentSelection: "", // 当前选中的文本
      isLongPressed: false, // 新增：是否处于长按状态
      longPressTimer: null, // 新增：长按定时器
      collectGroups: [], // 改为空数组，通过 API 获取数据
      selectedGroupId: "",
      showAddGroupDialog: false,
      newGroupName: "",
      searchGroupKeyword: "", // 添加搜索关键词
      localGroupId: 6, // 用于生成本地分组ID
      showSwipeTip: false, // 新增：是否显示首次使用提示
      progressWidth: 100,
      autoCloseTimer: null,
      progressTimer: null,
      showSubmitConfirm: false, // 添加-控制提交确认弹窗
      submitConfirmContent: "", // 添加-提交确认弹窗内容
    };
  },

  watch: {
    rawQuestions: {
      immediate: true,
      handler(newQuestions) {
        if (newQuestions.length) {
          this.questions = this.transformQuestions(newQuestions);
          // 初始化答案数组和答案显示状态数组
          this.answers = new Array(this.questions.length).fill(null);
          this.answerViewStates = new Array(this.questions.length).fill(false);
        }
      },
    },
    answerHistory: {
      immediate: true,
      handler(newHistory) {
        console.log("接收到新的答题历史:", newHistory);
        if (newHistory) {
          this.initAnswersFromHistory(newHistory);
          // 如果有答案历史，对应题目的答案显示状态也设置为 true
          newHistory.forEach((historyItem) => {
            const questionIndex = this.questions.findIndex(
              (q) =>
                String(q.id) === String(historyItem.questionNumber) ||
                String(q.id) === String(historyItem.questionId) ||
                String(q.questionNumber) === String(historyItem.questionNumber)
            );
            if (questionIndex !== -1 && historyItem.answer) {
              this.$set(this.answerViewStates, questionIndex, true);
            }
          });
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
    // 计算选中文本的总长度
    totalSelectedLength() {
      return this.selectedTexts.reduce((total, text) => total + text.length, 0);
    },
    // 添加过滤后的分组列表计算属性
    filteredGroups() {
      if (!this.searchGroupKeyword) return this.collectGroups;
      const keyword = this.searchGroupKeyword.toLowerCase();
      return this.collectGroups.filter((group) =>
        group.name.toLowerCase().includes(keyword)
      );
    },
  },

  methods: {
    getQuestionType(type) {
      const typeMap = {
        单选: "single",
        多选: "multiple",
        填空题: "blank",
        简答题: "essay",
        论述题: "essay",
        综合题: "essay", // 添加综合题映射
        综合应用题: "essay",
        综合应用: "essay",
        综合分析题: "essay",
        综合分析: "essay",
        // 其他可能的综合类型...
      };

      // 如果是以"综合"开头的题型，都归类为 essay
      if (type && type.startsWith("综合")) {
        return "essay";
      }

      return typeMap[type] || "single";
    },

    getQuestionTypeLabel(type, index = this.currentQuestion) {
      if (!type) return "";
      const question = this.questions[index];

      // 如果原始题型以"综合"开头，直接返回原始题型
      if (question?.originalType && question.originalType.startsWith("综合")) {
        return question.originalType.replace("题", ""); // 去掉"题"字
      }

      const types = {
        single: "单选",
        multiple: "多选",
        blank: "填空",
        essay:
          question?.originalType === "论述题"
            ? question.originalType // 论述题保留"题"字
            : "简答",
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

      // 对于单选题，选择后自动显示答案
      if (this.questions[index].type === "single") {
        // 显示答案解析并记录状态
        this.showingAnswer = true;
        this.$set(this.answerViewStates, index, true);

        // 检查答案是否正确
        const isCorrect = this.checkAnswer(this.questions[index], value);

        // 播放对应音效
        if (isCorrect) {
          this.playCorrectSound();
          setTimeout(() => {
            if (index < this.questions.length - 1) {
              this.currentQuestion = index + 1;
            }
          }, 800);
        } else {
          this.playWrongSound();
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
    },

    // 主观题（填空/简答）在离开当前题时需要手动触发保存
    saveSubjectiveAnswer(questionIndex) {
      const question = this.questions[questionIndex];
      if (!question || !["blank", "essay"].includes(question.type)) {
        return Promise.resolve();
      }

      const answer = this.answers[questionIndex];
      const formattedAnswer =
        question.type === "blank" && Array.isArray(answer) ? answer.join(",") : answer;

      return AnswerQuestionsApi.uploadAnswer({
        answerQuestionsId: this.answerId,
        answer: formattedAnswer,
        questionNumber: question.id,
      })
        .then((res) => {
          console.log("上传答案结果:", res);
          return res;
        })
        .catch((error) => {
          console.error("上传答案失败:", error);
        });
    },

    submitExam() {
      // 检查是否有非选择题
      const hasNonChoiceQuestions = this.questions.some(
        (q) => q.type === "blank" || q.type === "essay"
      );

      // 构建提示内容
      let content =
        this.mode === "5"
          ? "确认保存答案吗？"
          : "确认提交答卷吗？提交后将无法修改答案";

      if (hasNonChoiceQuestions) {
        content +=
          '<br/><br/><span style="color: #ff4d4f; font-weight: bold;">非选择题，请自行点击"完成作答"后才会统计分数，否则均为0分</span>';
      }

      this.submitConfirmContent = content;
      this.showSubmitConfirm = true;
    },

    cancelSubmit() {
      this.showSubmitConfirm = false;
    },

    async confirmSubmit() {
      this.showSubmitConfirm = false;
      // 显示加载提示
      uni.showLoading({
        title: "正在提交...",
        mask: true,
      });

      // 先上传当前题目的答案
      const currentQuestion = this.questions[this.currentQuestion];
      const currentAnswer = this.answers[this.currentQuestion];

      if (currentAnswer) {
        try {
          await AnswerQuestionsApi.uploadAnswer({
            answerQuestionsId: this.answerId,
            answer: Array.isArray(currentAnswer)
              ? currentAnswer.join(",")
              : currentAnswer,
            questionNumber: currentQuestion.id,
          });
        } catch (error) {
          console.error("上传当前答案失败:", error);
        }
      }

      // 原有的提交逻辑
      console.log("提交的答案：", this.answerId);
      const data = this.answers.map((answer, index) => ({
        answerQuestionsId: this.answerId,
        answer: Array.isArray(answer) ? answer.join(",") : answer,
        questionNumber: this.questions[index].id,
        questionType: this.questions[index].type,
        usedTime: this.usedTime,
      }));

      AnswerQuestionsApi.submit(this.answerId, data)
        .then((res) => {
          // 隐藏加载提示
          uni.hideLoading();

          uni.showToast({
            title: "提交成功",
            icon: "success",
            duration: 2000,
          });
          console.log("返回上一页");
          uni.navigateBack();
        })
        .catch((err) => {
          // 发生错误时隐藏加载提示
          uni.hideLoading();

          uni.showToast({
            title: "提交失败，请重试",
            icon: "none",
            duration: 2000,
          });
        });
    },

    handlePageChange(e) {
      const oldQuestion = this.currentQuestion;
      const newQuestion = e.detail.current;

      // 切换题目时重置滚动位置
      this.scrollTop = 0;

      // 获取离开的题目信息
      if (oldQuestion !== newQuestion) {
        const currentQuestion = this.questions[oldQuestion];
        const answer = this.answers[oldQuestion];

        // 保存当前题目的答案显示状态
        this.$set(this.answerViewStates, oldQuestion, this.showingAnswer);

        console.log("页面切换信息:", {
          oldQuestion,
          newQuestion,
          currentQuestionType: currentQuestion?.type,
          answer,
          answers: this.answers,
        });

        this.saveSubjectiveAnswer(oldQuestion);
      }

      // 更新当前题目索引并设置答案显示状态
      this.currentQuestion = newQuestion;
      // 直接使用记录的状态，不做额外处理
      this.showingAnswer = this.answerViewStates[newQuestion] || false;
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
          // TODO: 实 judge 接口调用
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

    onMainContainerClick() {
      if (this.showAnswerCard) {
        this.showAnswerCard = false;
      }
    },

    handleBack() {
      uni.showModal({
        title: "提示",
        content: "是否保存答题记录？",
        cancelText: "不保存",
        confirmText: "保存",
        success: (res) => {
          if (res.confirm) {
            // 用户选择保存时，先保存当前正在编辑的主观题答案
            this.saveSubjectiveAnswer(this.currentQuestion).finally(() => {
              history.back();
            });
          } else {
            // 用户选择不保存，显示二次确认
            uni.showModal({
              title: "警告",
              content: "不保存将删除当前答题记录，确定要继续吗？",
              cancelText: "取消",
              confirmText: "确定",
              success: (secondRes) => {
                if (secondRes.confirm) {
                  // 用户确认删除，调用清除接口后返回
                  AnswerQuestionsApi.clearAnswer(this.answerId)
                    .then(() => {
                      history.back();
                    })
                    .catch((err) => {
                      console.error("清除答题记录失败:", err);
                      uni.showToast({
                        title: "清除记录失败",
                        icon: "none",
                      });
                    });
                }
                // 如果用户点击取消，则不做任何操作，停留在当前页面
              },
            });
          }
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
      console.log("转换前的原始题目:", rawQuestions);
      const transformed = rawQuestions.map((q) => ({
        id: q.id || q.questionNumber, // 添加 questionNumber 作为备选
        type: this.getQuestionType(q.type),
        originalType: q.type,
        content: q.title,
        score: q.score,
        options: this.transformOptions(q.options),
        correct: q.answer,
        explanation: q.analysis,
        sort: q.sort,
        blanks:
          this.getQuestionType(q.type) === "blank" ? this.parseBlankCount(q.title) : [],
      }));
      console.log("转换后的题目:", transformed);
      return transformed;
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

    // 解填空题容将划线等转换为输入
    parseBlankContent(content) {
      const parts = [];
      let lastIndex = 0;
      let blankIndex = 0;

      // 处理种可能填空格式
      const blankRegex = /_{2,}|\[.*?\]|（\s*）/g;
      let match;

      while ((match = blankRegex.exec(content)) !== null) {
        // 加填空的本
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
        if (!optionsStr) return [];
        const options = JSON.parse(optionsStr);
        return Object.entries(options)
          .filter(([key, text]) => key && text && text.trim()) // 修改这里，过滤掉null和空字符串
          .map(([value, text]) => ({
            value: value.toUpperCase(),
            text: text.trim(),
          }));
      } catch (e) {
        console.error("转换选项出错:", e);
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
        综合题: "essay", // 添加综合题映射
        综合应用题: "essay",
        综合应用: "essay",
        综合分析题: "essay",
        综合分析: "essay",
        // 其他可能的综合类型...
      };

      // 如果是以"综合"开头的题型，都归类为 essay
      if (type && type.startsWith("综合")) {
        return "essay";
      }

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

      // 没有答案时显示未答
      if (!answer) return "unanswered";

      // 填空题特殊处理
      if (question.type === "blank") {
        // 修改这里：如果有任何答案，就显示为待批改状态，与essay保持一致
        if (Array.isArray(answer) && answer.some((item) => item && item.trim())) {
          return "pending";
        }
        return "unanswered";
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

      // 有答案不显示解析
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

    // 修改切换答案显示方法
    toggleAnswerView() {
      this.showingAnswer = !this.showingAnswer;
      // 保存当前题目的答案显示状态
      this.$set(this.answerViewStates, this.currentQuestion, this.showingAnswer);
    },

    // 修改提交答方法
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

      try {
        const res = await AiApi.judge(currentQuestion.id, answer, this.answerId);
        if (res.code === 200) {
          // 根据得分判断播放音效
          if (res.data.score > 0) {
            this.playCorrectSound();
          } else {
            this.playWrongSound();
          }

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

    // 新增：初化寸方法
    initSizes() {
      const sysInfo = uni.getSystemInfoSync();
      this.screenWidth = sysInfo.windowWidth;
      this.screenHeight = sysInfo.windowHeight;

      // 转换柄尺寸（80rpx 和 180rpx）
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

    // 显示记忆方法
    showMemoryTip(questionId) {
      // 如果已经显示,则不重复请求
      if (this.showingMemoryTip[questionId]) return;

      // 添加积分消耗提示
      uni.showModal({
        title: "积分提醒",
        content: "查看此题记忆方法需消耗0.2积分，是否继续？",
        cancelText: "取消",
        confirmText: "确认查看",
        success: (res) => {
          if (res.confirm) {
            // 显示加载提示
            uni.showLoading({
              title: "加载中...",
              mask: true,
            });

            // 用户点击确定,继续原有逻辑
            AiApi.getMemory(questionId)
              .then((res) => {
                uni.hideLoading();

                if (res.code === 200 && Array.isArray(res.data)) {
                  // 显示积分扣除成功提示
                  uni.showToast({
                    title: "已扣除0.2积分",
                    icon: "none",
                    duration: 1500,
                  });

                  // 格式化记忆方法内容
                  let content = "";

                  res.data.forEach((item) => {
                    content += '<div style="margin-bottom: 16rpx;">';
                    content += `<div style="font-weight: bold; color: #8b4513; margin-bottom: 8rpx;">${item.type}：</div>`;

                    // 如果有关键词数组，先显示关键词
                    if (item.keyword && item.keyword.length) {
                      content += `<div style="margin-bottom: 8rpx;">${item.keyword.join(
                        "、"
                      )}</div>`;
                    }

                    // 显示记忆内容
                    if (item.memory && item.memory.length) {
                      content += item.memory
                        .map((m) => `<div style="margin: 4rpx 0;">• ${m}</div>`)
                        .join("");
                    }

                    content += "</div>";
                  });

                  // 更新记忆方法内容和显示状态
                  this.$set(this.memoryTipContent, questionId, content);
                  this.$set(this.showingMemoryTip, questionId, true);
                } else {
                  uni.showToast({
                    title: "获取记忆方法失败",
                    icon: "none",
                  });
                }
              })
              .catch((error) => {
                uni.hideLoading();
                console.error("获取记忆方法失败:", error);

                // 根据错误类型显示不同提示
                if (error.code === "INSUFFICIENT_POINTS") {
                  uni.showModal({
                    title: "积分不足",
                    content: "您的积分余额不足，无法查看记忆方法",
                    showCancel: false,
                    confirmText: "我知道了",
                  });
                } else {
                  uni.showToast({
                    title: error.msg + "，未扣除积分",
                    icon: "none",
                    duration: 2000,
                  });
                }
              });
          }
        },
      });
    },

    // 处理忆方法点击
    handleMemoryTip(questionId) {
      this.showMemoryTip(questionId);
    },

    openAiChat() {
      // 获取当前题目信息
      const currentQuestion = this.questions[this.currentQuestion];

      // 提取题目内容（去除HTML标签）
      let questionContent = currentQuestion.content || '';
      // 移除HTML标签
      questionContent = questionContent.replace(/<[^>]*>/g, '').trim();
      // 截取前20个字符作为标题
      const questionTitle = questionContent.substring(0, 20);

      // 跳转到 AI 导师页面，并传递题号和题目内容参数
      uni.navigateTo({
        url: `/pages/ai-tutor/index?questionId=${currentQuestion.id}&questionNumber=${
          this.currentQuestion + 1
        }&questionTitle=${encodeURIComponent(questionTitle)}`,
      });
    },

    // 新增：切换收藏状态
    toggleCollect(questionId) {
      // 使用 $set 确保响应式更新
      this.$set(this.isCollected, questionId, !this.isCollected[questionId]);

      // 显示提示
      uni.showToast({
        title: this.isCollected[questionId] ? "收藏成功" : "已取消收藏",
        icon: "none",
        duration: 1500,
      });
    },

    // 修改显示收藏弹窗方法
    async showCollectDialog(questionId) {
      this.currentQuestionId = questionId;
      this.selectedTexts = [];
      this.selectedIndexes = [];
      this.selectedGroupId = "";

      // 解析内容为段落
      this.parsedParagraphs = this.parseContentToParagraphs(
        this.memoryTipContent[questionId]
      );

      // 获取收藏分组列表
      await this.getCollectGroups();

      this.showCollectSelect = true;
    },

    // 解析内容为段落
    parseContentToParagraphs(htmlContent) {
      if (!htmlContent) return [];

      const paragraphs = [];

      // 移除所有HTML标签，保留文本内容和基本格式
      let content = htmlContent
        .replace(/<div style="font-weight: bold[^>]*>([^<]*)<\/div>/g, "【$1】\n") // 将粗体标题转换为【】格式
        .replace(/<div style="margin: 4rpx 0;">•\s*(.*?)<\/div>/g, "• $1\n") // 保留项目符号
        .replace(/<[^>]+>/g, "") // 移除其他HTML标签
        .trim();

      // 按照换行符分割内容
      const lines = content.split("\n").filter((line) => line.trim());

      // 将内容按照标题分组
      let currentType = "";
      let currentContent = [];

      lines.forEach((line) => {
        if (line.startsWith("【") && line.endsWith("】")) {
          // 如果已经有累积的内容，保存为一个段落
          if (currentType && currentContent.length > 0) {
            paragraphs.push({
              type: currentType,
              content: currentContent.join("\n"),
              keywords: "",
            });
          }
          // 更新当前类型
          currentType = line.slice(1, -1);
          currentContent = [];
        } else {
          currentContent.push(line);
        }
      });

      // 添加最后一个段落
      if (currentType && currentContent.length > 0) {
        paragraphs.push({
          type: currentType,
          content: currentContent.join("\n"),
          keywords: "",
        });
      }

      return paragraphs;
    },

    // 切换段落选择状态
    toggleParagraphSelect(index, paragraph) {
      const position = this.selectedIndexes.indexOf(index);
      if (position === -1) {
        // 添加选中
        this.selectedIndexes.push(index);
        this.selectedTexts.push({
          type: paragraph.type,
          content: paragraph.content,
        });
      } else {
        // 取消选中
        this.selectedIndexes.splice(position, 1);
        this.selectedTexts.splice(position, 1);
      }
    },

    // 移除已选择的内容
    removeSelected(index) {
      this.selectedTexts.splice(index, 1);
      this.selectedIndexes.splice(index, 1);
    },

    // 清空所有已选择的内容
    clearSelected() {
      this.selectedTexts = [];
      this.selectedIndexes = [];
    },

    // 确认收藏
    async confirmCollect() {
      if (this.selectedTexts.length === 0) {
        uni.showToast({
          title: "请选择要收藏的内容",
          icon: "none",
        });
        return;
      }

      if (!this.selectedGroupId) {
        uni.showToast({
          title: "请选择收藏分组",
          icon: "none",
        });
        return;
      }

      try {
        // 显示加载提示
        uni.showLoading({
          title: "收藏中...",
          mask: true,
        });

        // 组合所有选中的内容
        const content = this.selectedTexts
          .map((item) => {
            return `【${item.type}】${item.content}`;
          })
          .join("\n\n");

        // 调用收藏接口
        const collectData = {
          groupId: this.selectedGroupId,
          content: content,
          topicId: this.currentQuestionId,
        };

        const res = await CollectInfoApi.addCollectInfo(collectData);

        if (res.code === 200) {
          // 更新本地分组计数
          const groupIndex = this.collectGroups.findIndex(
            (g) => g.id === this.selectedGroupId
          );
          if (groupIndex !== -1) {
            this.collectGroups[groupIndex].count++;
          }

          this.$set(this.isCollected, this.currentQuestionId, true);

          uni.showToast({
            title: "收藏成功",
            icon: "success",
          });

          this.closeCollectDialog();
        } else {
          uni.showToast({
            title: res.msg || "收藏失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("收藏失败:", error);
        uni.showToast({
          title: "收藏失败，请重试",
          icon: "none",
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 关闭弹窗
    closeCollectDialog() {
      this.showCollectSelect = false;
      this.selectedTexts = [];
      this.selectedIndexes = [];
      this.currentQuestionId = null;
    },

    // 获取收藏分组列表
    async getCollectGroups() {
      try {
        // 显示加载提示
        uni.showLoading({
          title: "加载中...",
          mask: true,
        });

        const res = await CollectGroupApi.getCollectGroupList();

        if (res.code === 200) {
          // 更新收藏分组列表，使用 infoCount 替代 count
          this.collectGroups = res.data.map((group) => ({
            id: group.id,
            name: group.name,
            count: parseInt(group.infoCount) || 0, // 将 infoCount 转为数字类型
          }));
        } else {
          uni.showToast({
            title: res.msg || "获取分组失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("获取收藏分组失败:", error);
        uni.showToast({
          title: "获取分组失败，请重试",
          icon: "none",
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 选择分组
    selectGroup(groupId) {
      this.selectedGroupId = groupId;
    },

    // 显示新建分组弹窗
    showAddGroup() {
      this.showAddGroupDialog = true;
      this.newGroupName = "";
    },

    // 关闭新建分组弹窗
    closeAddGroup() {
      this.showAddGroupDialog = false;
      this.newGroupName = "";
    },

    // 监听分组名称输入
    onGroupNameInput(e) {
      this.newGroupName = e.detail.value.slice(0, 20);
    },

    // 创建新分组
    async createGroup() {
      if (!this.newGroupName.trim()) return;

      try {
        // 显示加载提示
        uni.showLoading({
          title: "创建中...",
          mask: true,
        });

        const res = await CollectGroupApi.addCollectGroup({
          name: this.newGroupName.trim(),
        });

        if (res.code === 200) {
          // 创建成功后，重新获取分组列表
          await this.getCollectGroups();

          // 自动选中新创建的分组
          if (res.data?.id) {
            this.selectedGroupId = res.data.id;
          }

          this.closeAddGroup();

          uni.showToast({
            title: "创建成功",
            icon: "success",
          });
        } else {
          uni.showToast({
            title: res.msg || "创建失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("创建分组失败:", error);
        uni.showToast({
          title: "创建失败，请重试",
          icon: "none",
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 添加搜索相关方法
    onSearchInput(e) {
      this.searchGroupKeyword = e.detail.value;
    },

    clearSearch() {
      this.searchGroupKeyword = "";
    },

    // 新增：显示首次使用提示
    showSwipeTipDialog() {
      this.showSwipeTip = true;
    },

    // 新增：关闭首次使用提示
    closeSwipeTip() {
      this.showSwipeTip = false;
      this.clearTimers();
    },

    // 禁用提示
    disableTip() {
      try {
        uni.setStorageSync("neverShowSwipeTip", true);
        this.closeSwipeTip();
      } catch (e) {
        console.error("Storage error:", e);
      }
    },

    // 清理定时器
    clearTimers() {
      if (this.autoCloseTimer) {
        clearTimeout(this.autoCloseTimer);
        this.autoCloseTimer = null;
      }
      if (this.progressTimer) {
        clearInterval(this.progressTimer);
        this.progressTimer = null;
      }
    },

    // 初始化提示
    initSwipeTip() {
      try {
        const neverShow = uni.getStorageSync("neverShowSwipeTip");
        const hasUsed = uni.getStorageSync("hasUsedExam");

        // 只有当用户没有选择"不再提示"且是首次使用时才显示提示
        if (!neverShow && !hasUsed && this.currentQuestion === 0) {
          setTimeout(() => {
            // 使用新的方法名
            this.showSwipeTipDialog();
            this.startAutoClose();
            // 记录已使用状态
            uni.setStorageSync("hasUsedExam", true);
          }, 500);
        }
      } catch (e) {
        console.error("Storage error:", e);
      }
    },

    // 开始自动关闭倒计时
    startAutoClose() {
      this.progressWidth = 100;
      const duration = 3000; // 3秒后自动关闭
      const interval = 30; // 进度条更新间隔
      const step = (100 * interval) / duration;

      this.progressTimer = setInterval(() => {
        this.progressWidth = Math.max(0, this.progressWidth - step);
      }, interval);

      this.autoCloseTimer = setTimeout(() => {
        this.closeSwipeTip();
      }, duration);
    },

    // 新增初始化答案的方法
    initAnswersFromHistory(history) {
      if (!Array.isArray(history)) return;

      console.log("开始初始化答案，历史记录:", history);
      console.log("当前题目列表:", this.questions);

      history.forEach((historyItem) => {
        // 尝试多种可能的 ID 匹配
        const questionIndex = this.questions.findIndex(
          (q) =>
            String(q.id) === String(historyItem.questionNumber) ||
            String(q.id) === String(historyItem.questionId) ||
            String(q.questionNumber) === String(historyItem.questionNumber)
        );

        console.log("匹配题目:", {
          questionNumber: historyItem.questionNumber,
          questionId: historyItem.questionId,
          foundIndex: questionIndex,
          answer: historyItem.answer,
        });

        if (questionIndex !== -1) {
          const questionType = this.questions[questionIndex].type;
          let formattedAnswer = historyItem.answer;

          // 根据题目类型处理答案格式
          if (questionType === "multiple" && typeof formattedAnswer === "string") {
            formattedAnswer = formattedAnswer.split(",");
          } else if (questionType === "blank" && typeof formattedAnswer === "string") {
            formattedAnswer = formattedAnswer.split(",");
          }

          console.log("设置答案:", {
            index: questionIndex,
            type: questionType,
            rawAnswer: historyItem.answer,
            formattedAnswer: formattedAnswer,
          });

          this.$set(this.answers, questionIndex, formattedAnswer);
        } else {
          console.warn("未找到匹配的题目:", historyItem);
        }
      });

      console.log("初始化后的答案数组:", this.answers);
    },

    // 添加滚动处理方法
    handleScroll(e) {
      this.lastScrollTop = e.detail.scrollTop;
    },

    // 播放正确音效
    playCorrectSound() {
      try {
        const soundSetting = uni.getStorageSync("soundEnabled");
        console.log("音效设置:", soundSetting);

        // 判断是否启用音效（支持直接布尔值或对象格式）
        const isEnabled =
          soundSetting === true ||
          (soundSetting && soundSetting.data === true) ||
          soundSetting === "";

        if (isEnabled) {
          // 每次播放前重新创建音频实例
          if (this.correctAudio) {
            this.correctAudio.destroy();
          }
          this.correctAudio = uni.createInnerAudioContext();
          this.correctAudio.autoplay = false; // 设置为不自动播放
          this.correctAudio.src = "/static/audio/bingo.mp3";

          // 监听音频加载完成
          this.correctAudio.onCanplay(() => {
            console.log("正确音效加载完成");
            // 不在这里直接播放
          });

          // 监听播放完成
          this.correctAudio.onEnded(() => {
            console.log("正确音效播放完成");
            this.correctAudio.destroy();
            this.correctAudio = null;
          });

          // 监听错误
          this.correctAudio.onError((res) => {
            console.error("正确音效播放错误:", res);
            if (this.correctAudio) {
              this.correctAudio.destroy();
              this.correctAudio = null;
            }
          });

          // 确保在用户交互的上下文中播放
          setTimeout(() => {
            if (this.correctAudio) {
              this.correctAudio.play();
            }
          }, 100);
        }
      } catch (e) {
        console.error("播放正确音效失败:", e);
      }
    },

    // 播放错误音效
    playWrongSound() {
      try {
        const soundSetting = uni.getStorageSync("soundEnabled");
        console.log("音效设置:", soundSetting);

        // 判断是否启用音效（支持直接布尔值或对象格式）
        const isEnabled =
          soundSetting === true ||
          (soundSetting && soundSetting.data === true) ||
          soundSetting === "";

        if (isEnabled) {
          // 每次播放前重新创建音频实例
          if (this.wrongAudio) {
            this.wrongAudio.destroy();
          }
          this.wrongAudio = uni.createInnerAudioContext();
          this.wrongAudio.autoplay = false; // 设置为不自动播放
          this.wrongAudio.src = "/static/audio/wrong_answer.mp3";

          // 监听音频加载完成
          this.wrongAudio.onCanplay(() => {
            console.log("错误音效加载完成");
            // 不在这里直接播放
          });

          // 监听播放完成
          this.wrongAudio.onEnded(() => {
            console.log("错误音效播放完成");
            this.wrongAudio.destroy();
            this.wrongAudio = null;
          });

          // 监听错误
          this.wrongAudio.onError((res) => {
            console.error("错误音效播放错误:", res);
            if (this.wrongAudio) {
              this.wrongAudio.destroy();
              this.wrongAudio = null;
            }
          });

          // 确保在用户交互的上下文中播放
          setTimeout(() => {
            if (this.wrongAudio) {
              this.wrongAudio.play();
            }
          }, 100);
        }
      } catch (e) {
        console.error("播放错误音效失败:", e);
      }
    },

    // 销毁音频对象
    destroyAudio() {
      if (this.correctAudio) {
        this.correctAudio.destroy();
        this.correctAudio = null;
      }
      if (this.wrongAudio) {
        this.wrongAudio.destroy();
        this.wrongAudio = null;
      }
    },
  },
  mounted() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = currentPage.options;
    console.log("路径参数:", options);
    this.id = options.id;
    this.mode = options.mode;
    this.answerId = options.answerId;

    // 初始化答案显示状态数组
    this.answerViewStates = new Array(this.questions.length).fill(false);

    // 设置开始时间
    this.startTime = Date.now();

    // 启动计时器
    this.timer = setInterval(() => {
      this.usedTime = Math.floor((Date.now() - this.startTime) / 1000);
    }, 1000);

    // 初始化位置
    this.$nextTick(() => {
      this.initSizes();
    });

    // 初始化滑动提示
    this.$nextTick(() => {
      this.initSwipeTip();
    });
  },

  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.clearTimers();

    // 销毁音频对象
    this.destroyAudio();
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
  position: relative;
  overflow: hidden;
}

.question-card {
  padding: 24rpx 20rpx;
  margin-top: 20rpx;
  width: 100%;
  box-sizing: border-box;
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
  font-size: 34rpx;
  color: #333;
  line-height: 1.8;
  /* 增加行高，让文字间距更大 */
  margin-bottom: 32rpx;
  font-weight: 500;
  letter-spacing: 4rpx;
  /* 添加字间距 */
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
}

.option-item {
  padding: 20rpx 28rpx;
  /* 原来是 16rpx 24rpx */
  background-color: #f8f9fa;
  border-radius: 6rpx;
  border: 1rpx solid transparent;
  display: flex;
  align-items: center;
  gap: 16rpx;
  /* 原来是 12rpx */
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
  font-size: 32rpx;
  line-height: 1.8;
  /* 同样增加选项文字的行高 */
  letter-spacing: 4rpx;
  /* 保持与题目文字相同的字间距 */
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

.nav-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 24rpx;
  gap: 12rpx;
  transition: all 0.3s ease;
}

.nav-btn:active {
  opacity: 0.7;
}

.nav-icon {
  width: 40rpx;
  height: 40rpx;
}

.nav-btn text {
  font-size: 28rpx;
  color: #1890ff;
  font-weight: 500;
}

.submit-answer-section {
  padding: 32rpx 24rpx;
  padding-bottom: 120rpx;
  margin-top: 32rpx;
  border-top: 2rpx solid #f0f0f0;
  width: 100%;
  box-sizing: border-box;
}

.submit-answer-btn {
  width: 100%;
  padding: 24rpx;
  background: #52c41a;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.2);
  box-sizing: border-box;
}

.submit-answer-btn text {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.submit-answer-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
  background: #389e0d;
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
  font-size: 34rpx;
  color: #333;
  line-height: 1.6;
  padding: 16rpx;
  background: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  letter-spacing: 4rpx;
  /* 添加与题目一致的字间距 */
}

.explanation-text {
  font-size: 34rpx;
  color: #666;
  line-height: 1.6;
  padding: 16rpx;
  background: #fff;
  border-radius: 8rpx;
  letter-spacing: 4rpx;
  /* 添加与题目一致的字间距 */
}

.explanation-label {
  display: inline-block;
  color: #1890ff;
  font-weight: 500;
  margin-right: 8rpx;
  position: relative;
  font-size: 34rpx;
  letter-spacing: 4rpx;
  /* 添加与题目一致的字间距 */
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
  font-size: 32rpx;
  /* 原来是 28rpx */
}

.essay-input {
  width: 100%;
  min-height: 300rpx;
  padding: 28rpx;
  /* 原来是 24rpx */
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 32rpx;
  /* 原来是 28rpx */
  line-height: 1.6;
  /* 原来是 1.8 */
}

/* 添加或修改样式 */
.blank-content {
  margin: 20rpx 0;
  line-height: 2;
  font-size: 34rpx;
  color: #333;
  letter-spacing: 4rpx;
  padding: 0;
  /* 确保没有内边距 */
}

.blank-text {
  word-wrap: break-word;
  white-space: pre-wrap;
  display: inline;
  letter-spacing: 4rpx;
}

.blank-wrapper {
  display: inline-flex;
  align-items: center;
  margin: 0 12rpx;
  vertical-align: middle;
  min-width: 200rpx;
}

/* 修改填空题选项容器样式 */
.options.blank {
  padding: 0;
  /* 移除填空题选项的内边距 */
}

.blank-input {
  width: 200rpx;
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
  margin: 0 4rpx;
  /* 添加输入框的左右间距 */
}

.blank-input:focus {
  border-bottom-color: #1890ff;
  background: #fff;
}

/* 论述题样式优化 */
.essay-container {
  margin-top: 10rpx;
  border-radius: 12rpx;
  padding: 0 24rpx;
  /* 调整为与单选题一致的左右内边距 */
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.essay-input {
  width: 100%;
  min-height: 400rpx;
  padding: 24rpx;
  box-sizing: border-box;
  font-size: 34rpx;
  line-height: 1.8;
  letter-spacing: 4rpx;
  color: #333;
  background-color: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 8rpx;
  transition: all 0.3s ease;
  margin-top: 20rpx;
  /* 添加上边距，与题目保持适当间距 */
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
  will-change: transform;
  /* 优化性能 */
}

.handle-text {
  writing-mode: vertical-lr;
  text-orientation: upright;
  letter-spacing: 8rpx;
  font-weight: 500;
  user-select: none;
  /* 止文字选中 */
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
  font-size: 34rpx;
  /* 从 28rpx 改为 34rpx，与题目字号一致 */
  color: #333;
  line-height: 1.6;
  padding: 16rpx;
  background: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
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
  font-size: 34rpx;
  /* 从 28rpx 改为 34rpx，与题目字号一致 */
  color: #333;
  line-height: 1.6;
  padding: 16rpx;
  background: #fff;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

/* 优化答案显示区域式 */
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

/* 优化按样式 */
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
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
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
  font-size: 34rpx;
  /* 从 28rpx 改为 34rpx */
  color: #1890ff;
  font-weight: 500;
  margin-right: 8rpx;
}

.explanation-text {
  font-size: 34rpx;
  /* 从 28rpx 改为 34rpx */
  color: #666;
  line-height: 1.6;
  padding: 16rpx;
  background: #fff;
  border-radius: 8rpx;
}

/* 加图片hover效果 */
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

/* 保图可点击的样式 */
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

/* 修改记忆方法按钮样式 */
.memory-tip-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin: 24rpx 0;
  padding: 16rpx 32rpx;
  /* 使用更明显的黄金色渐变 */
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.25) 0%,
    rgba(218, 165, 32, 0.3) 100%
  );
  border-radius: 32rpx;
  /* 加重阴影并带有金色 */
  box-shadow: 0 4rpx 12rpx rgba(218, 165, 32, 0.25);
  transition: all 0.3s ease;
  cursor: pointer;
  /* 使用金色边框 */
  border: 2rpx solid rgba(218, 165, 32, 0.5);
}

.memory-tip-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(218, 165, 32, 0.2);
  /* 点击时加深金色 */
  background: linear-gradient(
    135deg,
    rgba(255, 215, 0, 0.3) 0%,
    rgba(218, 165, 32, 0.35) 100%
  );
}

/* 调整文字为深金色 */
.memory-tip-btn text {
  color: #8b6914;
  /* 深金色 */
  font-size: 34rpx;
  /* 从 28rpx 改为 34rpx */
  font-weight: 600;
  letter-spacing: 2rpx;
}

.crown-icon {
  width: 36rpx;
  height: 36rpx;
}

/* 记忆方法内容区域样式 */
.memory-tip-content {
  margin: 24rpx 0;
  padding: 24rpx;
  background: #fffaf0;
  border-radius: 12rpx;
  border: 2rpx solid #ffd700;
}

.memory-tip-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
  padding-right: 12rpx;
}

.memory-tip-title {
  color: #8b4513;
  font-size: 34rpx;
  /* 从 30rpx 改为 34rpx */
  font-weight: 600;
}

.memory-tip-text {
  font-size: 34rpx;
  /* 从 30rpx 改为 34rpx */
  color: #666;
  line-height: 1.8;
  letter-spacing: 4rpx;
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8rpx;
}

/* 修改样式 */
.ai-chat-area {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 997;
}

.ai-chat-btn {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
  pointer-events: auto;
  will-change: transform;
}

.ai-icon {
  width: 45rpx;
  height: 45rpx;
  margin-bottom: 4rpx;
}

.ai-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

.ai-chat-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.2);
}

/* 添加scroll-view样式 */
.question-scroll {
  height: 100%;
  box-sizing: border-box;
  /* #ifdef H5 */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  /* #endif */
}

/* 添加收藏按钮样式 */
.collect-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 28rpx;
  border: 2rpx solid rgba(218, 165, 32, 0.3);
  transition: all 0.3s ease;
}

.collect-btn:active {
  transform: scale(0.95);
  background: rgba(255, 215, 0, 0.2);
}

.collect-icon {
  font-size: 32rpx;
  color: #bbb;
  transition: all 0.3s ease;
}

.collect-icon.active {
  color: #ffd700;
}

.collect-text {
  font-size: 24rpx;
  color: #8b6914;
}

/* 收藏选择弹窗样式 */
.collect-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collect-dialog-content {
  width: 90%;
  max-width: 900rpx;
  height: 80vh;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.dialog-header {
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.dialog-close {
  font-size: 36rpx;
  color: #999;
  padding: 10rpx;
}

/* 主体内容区域 */
.collect-dialog-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 24rpx;
  gap: 24rpx;
}

/* 左侧内容区域 */
.content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-right: 1rpx solid #eee;
  padding-right: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.selected-count {
  font-size: 26rpx;
  color: #1890ff;
}

.content-list {
  flex: 1;
  overflow-y: auto;
}

.content-item {
  margin-bottom: 16rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  transition: all 0.3s ease;
}

.item-header {
  padding: 12rpx 16rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 1rpx solid #ddd;
  border-radius: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-icon {
  color: #1890ff;
  font-size: 24rpx;
  font-weight: bold;
}

.item-type {
  font-size: 26rpx;
  color: #666;
}

.item-content {
  padding: 16rpx;
  white-space: pre-wrap;
  word-break: break-all;
}

.item-keywords {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
  display: block;
}

.item-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  user-select: text;
}

.content-item.selected {
  border-color: #1890ff;
  background: #e6f7ff;
}

.content-item.selected .item-text {
  -webkit-line-clamp: unset;
  background: rgba(24, 144, 255, 0.1);
}

/* 右侧分组区域 */
.group-section {
  width: 300rpx;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.add-btn {
  font-size: 26rpx;
  color: #1890ff;
  padding: 6rpx 12rpx;
  border: 1rpx solid #1890ff;
  border-radius: 4rpx;
}

.search-box {
  position: relative;
  margin-bottom: 16rpx;
}

.search-input {
  width: 100%;
  height: 64rpx;
  padding: 0 60rpx 0 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 32rpx;
  font-size: 26rpx;
  background: #f5f7fa;
  box-sizing: border-box;
}

.clear-btn {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 28rpx;
  padding: 10rpx;
}

.group-list {
  flex: 1;
  overflow-y: auto;
}

.group-item {
  padding: 16rpx;
  margin-bottom: 12rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
}

.group-item.active {
  background: #e6f7ff;
  border: 1rpx solid #1890ff;
}

.group-name {
  font-size: 26rpx;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.group-count {
  font-size: 24rpx;
  color: #999;
  margin-left: 12rpx;
}

.empty-tip {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 32rpx 0;
}

/* 底部按钮区域 */
.dialog-footer {
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.btn {
  min-width: 160rpx;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  border-radius: 36rpx;
  font-size: 28rpx;
  transition: all 0.3s ease;
}

.btn.cancel {
  background: #f5f7fa;
  color: #666;
}

.btn.confirm {
  background: #1890ff;
  color: #fff;
}

.btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* 新建分组弹窗样式 */
.add-group-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-group-content {
  width: 600rpx;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.add-group-header {
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #eee;
}

.add-group-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.add-group-body {
  padding: 32rpx 24rpx;
  position: relative;
}

.group-name-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  background: #f5f7fa;
  box-sizing: border-box;
}

.input-count {
  position: absolute;
  right: 32rpx;
  bottom: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.add-group-footer {
  padding: 24rpx;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  border-top: 1rpx solid #eee;
}

/* 修改关闭按钮样式 */
.close-btn {
  font-size: 32rpx;
  color: #999;
  padding: 10rpx;
  cursor: pointer;
}

.close-btn:hover {
  color: #666;
}

/* 修改 add-group-footer 相关样式 */
.add-group-footer {
  padding: 24rpx;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  border-top: 1rpx solid #eee;
}

.dialog-btn {
  min-width: 160rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 36rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.3s ease;
}

.dialog-btn.cancel {
  background: #f5f7fa;
  color: #666;
  border: 2rpx solid #e8e8e8;
}

.dialog-btn.confirm {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
}

.dialog-btn:active {
  transform: scale(0.95);
  opacity: 0.9;
}

.dialog-btn.confirm:active {
  background: linear-gradient(135deg, #096dd9 0%, #0050b3 100%);
  box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.2);
}

.dialog-btn.disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* 首次使用提示样式 */
.swipe-tip {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.tip-content {
  background: rgba(255, 255, 255, 0.98);
  padding: 40rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30rpx;
  width: 80%;
  max-width: 600rpx;
}

.gesture-animation {
  margin: 20rpx 0;
}

.gesture-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
  animation: pulse 2s infinite;
}

.hand-icon {
  font-size: 60rpx;
  transform: rotate(90deg);
}

.arrow-left,
.arrow-right {
  width: 40rpx;
  height: 40rpx;
  border-top: 6rpx solid #1890ff;
  border-right: 6rpx solid #1890ff;
  animation: arrowMove 2s infinite;
}

.arrow-left {
  transform: rotate(-135deg);
}

.arrow-right {
  transform: rotate(45deg);
}

.tip-text {
  text-align: center;
}

.tip-text text {
  display: block;
  color: #333;
  font-size: 36rpx;
  font-weight: 600;
}

.tip-text .sub-text {
  font-size: 28rpx;
  color: #666;
  margin-top: 12rpx;
  font-weight: normal;
}

.progress-bar {
  width: 100%;
  height: 6rpx;
  background: #f0f0f0;
  border-radius: 3rpx;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: #1890ff;
  transition: width 0.1s linear;
}

.tip-options {
  display: flex;
  gap: 24rpx;
  margin-top: 20rpx;
}

.no-more-tip,
.confirm-btn {
  padding: 16rpx 32rpx;
  border-radius: 32rpx;
  font-size: 28rpx;
  transition: all 0.3s ease;
}

.no-more-tip {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #1890ff;
  color: #fff;
}

.no-more-tip:active,
.confirm-btn:active {
  transform: scale(0.95);
  opacity: 0.9;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes arrowMove {
  0%,
  100% {
    opacity: 0.3;
    transform: rotate(-135deg) translateX(0);
  }

  50% {
    opacity: 1;
    transform: rotate(-135deg) translateX(-10rpx);
  }
}

.arrow-right {
  animation: arrowMoveRight 2s infinite;
}

@keyframes arrowMoveRight {
  0%,
  100% {
    opacity: 0.3;
    transform: rotate(45deg) translateX(0);
  }

  50% {
    opacity: 1;
    transform: rotate(45deg) translateX(10rpx);
  }
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56rpx;
  padding: 0 20rpx;
  border-radius: 28rpx;
  background: #52c41a;
  color: #fff;
  font-size: 26rpx;
  font-weight: 500;
  box-shadow: 0 2rpx 8rpx rgba(82, 196, 26, 0.2);
  transition: all 0.3s ease;
}

.submit-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
  background: #389e0d;
}

.submit-btn .icon-text-wrapper {
  display: inline-flex;
  align-items: center;
  height: 100%;
}

.submit-btn svg {
  width: 28rpx;
  height: 28rpx;
  fill: #fff;
  margin-right: 6rpx;
  display: block;
  position: relative;
  top: 1rpx;
}

.submit-btn text {
  font-size: 26rpx;
  color: #fff;
  line-height: 28rpx;
  display: block;
}

.submit-btn .icon-text-wrapper {
  display: inline-flex;
  align-items: center;
  height: 100%;
}

.submit-btn svg {
  width: 28rpx;
  height: 28rpx;
  fill: #fff;
  margin-right: 6rpx;
  display: block;
  position: relative;
  top: 1rpx;
}

.submit-btn text {
  font-size: 26rpx;
  color: #fff;
  line-height: 28rpx;
  display: block;
}

/* 自定义弹窗样式 */
.custom-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 80%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.modal-header {
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #eee;
  text-align: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-body {
  padding: 32rpx;
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #eee;
}

.modal-footer .btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
}

.modal-footer .btn.cancel {
  color: #666;
}

.modal-footer .btn.confirm {
  color: #fff;
  background-color: #1890ff;
}
</style>
