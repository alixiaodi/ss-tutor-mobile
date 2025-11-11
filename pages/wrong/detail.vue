<template>
  <view class="detail-container">
    <Navbar
      title="错题详情"
      bgColor="#f48c42"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></Navbar>

    <view class="content">
      <view class="card">
        <view class="section-title">题目</view>
        <rich-text :nodes="questionContent" class="question-text"></rich-text>
      </view>

      <view class="card info-card">
        <view class="info-row">
          <text class="label">题目类型</text>
          <text class="value">{{ typeLabel }}</text>
        </view>
        <view
          class="info-row"
          v-if="questionDetail.score !== null && questionDetail.score !== undefined"
        >
          <text class="label">题目分数</text>
          <text class="value">{{ questionDetail.score }}</text>
        </view>
        <view class="info-row" v-if="questionDetail.subjectName">
          <text class="label">所属科目</text>
          <text class="value">{{ questionDetail.subjectName }}</text>
        </view>
        <view class="info-row" v-if="questionDetail.wrongCount">
          <text class="label">错误次数</text>
          <text class="value highlight">错 {{ questionDetail.wrongCount }} 次</text>
        </view>
        <view class="info-row" v-if="correctAnswer">
          <text class="label">正确答案</text>
          <text class="value highlight">{{ correctAnswer }}</text>
        </view>
        <view class="info-row" v-if="questionDetail.lastAnswer">
          <text class="label">你的答案</text>
          <text class="value">{{ questionDetail.lastAnswer }}</text>
        </view>
      </view>

      <view class="card" v-if="shouldShowOptions">
        <view class="section-title">选项</view>
        <view
          class="option-item"
          v-for="option in parsedOptions"
          :key="option.key"
          :class="{ 'option-item--correct': isCorrectOption(option.key) }"
        >
          <view
            class="option-label-wrapper"
            :class="{ 'option-label-wrapper--correct': isCorrectOption(option.key) }"
          >
            <text class="option-label">
              {{ option.key }}
            </text>
          </view>
          <view class="option-body">
            <rich-text :nodes="option.value" class="option-value"></rich-text>
            <view
              v-if="isCorrectOption(option.key)"
              class="option-tag"
            >
              正确答案
            </view>
          </view>
        </view>
      </view>

      <view class="card" v-if="questionDetail.analysis || analysisBlocks.length">
        <view class="section-title">题目解析</view>
        <rich-text
          v-if="questionDetail.analysis"
          :nodes="questionDetail.analysis"
          class="analysis-text"
        ></rich-text>
        <view v-else>
          <text class="section-desc">
            以下内容为演示数据，后续可替换为真实解析。
          </text>
          <view class="analysis-block" v-for="item in analysisBlocks" :key="item.title">
            <view class="block-title">{{ item.title }}</view>
            <rich-text :nodes="item.content" class="block-content"></rich-text>
          </view>
        </view>
      </view>

      <view class="card" v-if="questionDetail.memory">
        <view class="section-title">记忆方式</view>
        <view v-if="structuredMemorySections.length">
          <view class="memory-toggle" @click="toggleMemory">
            <text>{{ isMemoryExpanded ? "收起" : "展开全部" }}</text>
            <u-icon
              :name="isMemoryExpanded ? 'arrow-up' : 'arrow-down'"
              size="20"
              color="#f48c42"
            ></u-icon>
          </view>
          <view
            class="memory-section"
            v-for="(section, index) in visibleMemorySections"
            :key="section.type + index"
          >
            <view class="memory-section-header">
              <text class="memory-type">{{ section.type }}</text>
              <view class="keyword-tags" v-if="section.keywords.length">
                <text class="keyword-tag" v-for="tag in section.keywords" :key="tag">
                  {{ tag }}
                </text>
              </view>
            </view>
            <view class="memory-list">
              <view
                class="memory-item"
                v-for="(line, lineIndex) in section.items"
                :key="lineIndex"
              >
                <text class="memory-index">{{ lineIndex + 1 }}.</text>
                <rich-text :nodes="line" class="memory-text"></rich-text>
              </view>
            </view>
          </view>
          <view
            v-if="!isMemoryExpanded && structuredMemorySections.length > 2"
            class="memory-overlay"
            @click="toggleMemory"
          >
            <text>查看更多</text>
            <u-icon name="arrow-down" size="18" color="#fff"></u-icon>
          </view>
        </view>
        <text class="section-desc" v-else>{{ questionDetail.memory }}</text>
      </view>

      <view class="card action-card">
        <view class="section-title action-title">智能辅助</view>
        <view class="action-description">
          结合 AI 工具快速生成练习或获取讲解，帮助你巩固错题考点。
        </view>
        <view class="action-btn-group">
          <view class="action-item primary" @click="handleGenerateRelated">
            <view class="action-icon accent">
              <text class="action-icon-text">AI</text>
            </view>
            <view class="action-texts">
              <text class="action-entry-title">使用AI生成相关试题</text>
              <text class="action-entry-subtitle">智能组卷 · 拓展练习范围</text>
            </view>
            <u-icon name="arrow-right" color="#f48c42" size="18"></u-icon>
          </view>
          <view class="action-item secondary" @click="handleExplainQuestion">
            <view class="action-icon soft">
              <u-icon name="chat" color="#f48c42" size="22"></u-icon>
            </view>
            <view class="action-texts">
              <text class="action-entry-title">试题讲解</text>
              <text class="action-entry-subtitle">AI 导师逐步拆解本题</text>
            </view>
            <u-icon name="arrow-right" color="#c8ccd6" size="18"></u-icon>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import * as WrongQuestionApi from "@/api/wrongQuestion";

export default {
  components: {
    Navbar,
  },
  data() {
    return {
      loading: false,
      typeLabelMap: {
        single_choice: "单选题",
        multiple_choice: "多选题",
        fill_blank: "填空题",
        short_answer: "简答题",
      },
      questionDetail: {
        questionId: "",
        question: "",
        questionName: "",
        type: "",
        subjectCode: "",
        options: null,
        answer: "",
        questionAnswer: "",
        analysis: "",
        memory: "",
        score: null,
        subjectName: "",
        wrongCount: 0,
        lastAnswer: "",
      },
      isMemoryExpanded: false,
      analysisBlocks: [
        {
          title: "知识点回顾",
          content:
            "死锁产生的必要条件包含互斥、请求与保持、不剥夺以及循环等待。若能破坏其中任意一个条件，就可避免死锁。",
        },
        {
          title: "解题思路",
          content:
            "题目强调“可以由用户程序完成”，因此应考虑无需操作系统特权的方式，如通过软件同步算法实现互斥，而非依赖内核资源。",
        },
        {
          title: "易错提醒",
          content:
            "常见误区是忽略对共享资源的请求顺序。若所有进程按照既定顺序申请资源，可有效避免循环等待条件。",
        },
      ],
    };
  },
  computed: {
    questionContent() {
      return this.questionDetail.question || this.questionDetail.questionName || "";
    },
    typeLabel() {
      if (!this.questionDetail.type) {
        return this.questionDetail.questionTypeName || "未知题型";
      }
      return this.typeLabelMap[this.questionDetail.type] || this.questionDetail.type;
    },
    parsedOptions() {
      const rawOptions = this.questionDetail.options;
      if (!rawOptions) return [];

      let optionObj = rawOptions;
      if (typeof rawOptions === "string") {
        try {
          optionObj = JSON.parse(rawOptions);
        } catch (error) {
          console.warn("解析选项失败", error);
          return [];
        }
      }

      if (!optionObj || typeof optionObj !== "object") return [];

      return Object.entries(optionObj)
        .filter(([, value]) => {
          if (value === null || value === undefined) return false;
          return String(value).trim() !== "";
        })
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, value]) => ({
          key: key.toUpperCase(),
          value,
        }));
    },
    correctAnswer() {
      return this.questionDetail.answer || this.questionDetail.questionAnswer || "";
    },
    correctAnswerKeys() {
      const answer = this.correctAnswer;
      if (!answer) return [];

      if (Array.isArray(answer)) {
        return answer
          .map((item) => String(item || "").trim().toUpperCase())
          .filter(Boolean);
      }

      if (typeof answer === "string") {
        const trimmed = answer.trim().toUpperCase();
        if (!trimmed) return [];

        let parts = trimmed.split(/[,，;；\s]+/).filter(Boolean);
        if (parts.length === 1 && parts[0].length > 1 && this.isChoiceType) {
          parts = parts[0].split("").filter(Boolean);
        }
        return parts.map((item) => item.trim()).filter(Boolean);
      }

      return [];
    },
    isChoiceType() {
      return ["single_choice", "multiple_choice"].includes(this.questionDetail.type);
    },
    shouldShowOptions() {
      return this.isChoiceType && this.parsedOptions.length > 0;
    },
    structuredMemorySections() {
      const rawMemory = this.questionDetail.memory;
      if (!rawMemory) return [];

      let parsedMemory = rawMemory;
      if (typeof rawMemory === "string") {
        const trimmed = rawMemory.trim();
        if (!trimmed) return [];
        try {
          parsedMemory = JSON.parse(trimmed);
        } catch (error) {
          // 如果字符串无法解析为 JSON，则视为纯文本
          return [];
        }
      }

      if (!Array.isArray(parsedMemory)) return [];

      return parsedMemory
        .map((section, index) => {
          const items = this.normalizeMemoryEntries(section?.memory);
          if (!items.length) return null;

          return {
            type: section?.type || `记忆方式 ${index + 1}`,
            keywords: this.normalizeMemoryEntries(section?.keyword),
            items,
          };
        })
        .filter(Boolean);
    },
    visibleMemorySections() {
      if (this.isMemoryExpanded) {
        return this.structuredMemorySections;
      }
      return this.structuredMemorySections.slice(0, 2);
    },
  },
  onLoad(options) {
    if (options && Object.keys(options).length) {
      const { questionId, questionName, questionAnswer, subjectName, id } = options;
      this.mergeQuestionDetail({
        questionId: questionId || this.questionDetail.questionId,
        questionName: questionName
          ? decodeURIComponent(questionName)
          : this.questionDetail.questionName,
        questionAnswer: questionAnswer || this.questionDetail.questionAnswer,
        subjectName: subjectName || this.questionDetail.subjectName,
      });

      if (id) {
        this.loadQuestionDetail(id);
      }
    }
  },
  methods: {
    isCorrectOption(optionKey) {
      if (!optionKey) return false;
      return this.correctAnswerKeys.includes(String(optionKey).toUpperCase());
    },
    toggleMemory() {
      this.isMemoryExpanded = !this.isMemoryExpanded;
    },
    normalizeMemoryEntries(value) {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value
          .map((item) => (typeof item === "string" ? item.trim() : item))
          .filter((item) => {
            if (typeof item === "string") {
              return item.trim().length > 0;
            }
            return item !== null && item !== undefined;
          })
          .map((item) => (typeof item === "string" ? item : String(item)));
      }
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return [];
        try {
          const parsed = JSON.parse(trimmed);
          return this.normalizeMemoryEntries(parsed);
        } catch (error) {
          return [trimmed];
        }
      }
      return [String(value)];
    },
    handleGenerateRelated() {
      const subjectCode =
        this.questionDetail.subjectCode ||
        uni.getStorageSync("lastSelectedSubject")?.subjectCode ||
        "";
      const query = subjectCode ? `?subjectCode=${subjectCode}` : "";
      uni.navigateTo({
        url: `/pages/ai-question-bank/index${query}`,
      });
    },
    handleExplainQuestion() {
      const questionId = this.questionDetail.questionId;
      const query = questionId ? `?questionId=${questionId}` : "";
      uni.navigateTo({
        url: `/pages/ai-tutor/index${query}`,
      });
    },
    mergeQuestionDetail(partial = {}) {
      this.questionDetail = {
        ...this.questionDetail,
        ...partial,
      };
    },
    async loadQuestionDetail(id) {
      if (!id) return;
      try {
        this.loading = true;
        uni.showLoading({ title: "加载中..." });
        const res = await WrongQuestionApi.getWrongQuestionDetail(id);
        const detailData =
          res?.data && typeof res.data === "object"
            ? res.data
            : Array.isArray(res)
            ? res[0]
            : typeof res === "object"
            ? res
            : null;
        if (detailData) {
          this.mergeQuestionDetail(detailData);
        }
      } catch (error) {
        console.error("获取错题详情失败", error);
        uni.showToast({
          title: "获取详情失败",
          icon: "none",
        });
      } finally {
        this.loading = false;
        uni.hideLoading();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 24rpx;
}

.card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16rpx;
}

.section-desc {
  display: block;
  font-size: 26rpx;
  color: #909399;
  margin-bottom: 24rpx;
}

.question-text {
  font-size: 30rpx;
  line-height: 1.6;
  color: #333;
}

.info-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  color: #606266;
}

.label {
  color: #909399;
}

.value {
  color: #303133;
}

.highlight {
  color: #f48c42;
  font-weight: 600;
}

.analysis-block + .analysis-block {
  margin-top: 24rpx;
}

.block-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2f2f2f;
  margin-bottom: 12rpx;
}

.block-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #4f4f4f;
}

.option-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 24rpx;
  border: 1rpx solid #f0f0f0;
  border-radius: 18rpx;
  margin-bottom: 18rpx;
  transition: all 0.2s ease;
}

.option-item:last-child {
  margin-bottom: 0;
}

.option-item--correct {
  border-color: #f48c42;
  background: #fff9f4;
  box-shadow: 0 6rpx 12rpx rgba(244, 140, 66, 0.15);
}

.option-label-wrapper {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: #f4f6fb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 600;
  color: #606266;
}

.option-label-wrapper--correct {
  background-image: linear-gradient(135deg, #f48c42, #f26c3b);
  color: #fff;
  box-shadow: 0 6rpx 12rpx rgba(244, 140, 66, 0.3);
}

.option-label {
  font-size: 28rpx;
  color: inherit;
}

.option-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.option-value {
  font-size: 28rpx;
  color: #303133;
  line-height: 1.6;
}

.option-tag {
  align-self: flex-start;
  padding: 4rpx 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #f26c3b;
  background-color: rgba(244, 140, 66, 0.15);
}

.analysis-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #4f4f4f;
}

.memory-section {
  border: 1rpx solid #f0f2f7;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  background-color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.04);
}

.memory-section:last-child {
  margin-bottom: 0;
}

.memory-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.memory-type {
  font-size: 30rpx;
  font-weight: 600;
  color: #f48c42;
}

.keyword-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.keyword-tag {
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  background-color: rgba(244, 140, 66, 0.12);
  color: #f26c3b;
  font-size: 22rpx;
}

.memory-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.memory-item {
  display: flex;
  gap: 12rpx;
  align-items: flex-start;
}

.memory-index {
  font-size: 24rpx;
  color: #909399;
  font-weight: 600;
}

.memory-text {
  flex: 1;
  font-size: 26rpx;
  line-height: 1.6;
  color: #303133;
}

.memory-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
  font-size: 26rpx;
  color: #f48c42;
  margin-bottom: 16rpx;
}

.memory-overlay {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background-color: #f48c42;
  color: #fff;
  font-size: 26rpx;
  width: fit-content;
  margin-left: auto;
  cursor: pointer;
}

.action-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.action-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.action-description {
  font-size: 26rpx;
  color: #909399;
  line-height: 1.5;
}

.action-btn-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  border-radius: 18rpx;
  border: 1rpx solid #f0f2f7;
  background-color: #fff;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.06);
}

.action-item.primary {
  border-color: rgba(244, 140, 66, 0.35);
  background-image: linear-gradient(120deg, #fffdf8, #fff6ef);
}

.action-item.secondary {
  background-color: #fff;
}

.action-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon.accent {
  background-image: linear-gradient(135deg, #f48c42, #f26c3b);
  box-shadow: 0 8rpx 18rpx rgba(244, 140, 66, 0.35);
}

.action-icon-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2rpx;
}

.action-icon.soft {
  background-color: #fff6ef;
  border: 1rpx solid rgba(244, 140, 66, 0.2);
}

.action-texts {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.action-entry-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #303133;
}

.action-entry-subtitle {
  font-size: 24rpx;
  color: #909399;
}
</style>
