<template>
  <view class="ai-bank-page">
    <Navbar
      title="AI题库"
      bgColor="#f48c42"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 600;"
    ></Navbar>

    <view class="ai-bank-body">
      <view
        class="subject-panel"
        :class="{ disabled: isLoading }"
        @click="chooseSubject"
      >
        <view class="subject-info">
          <text class="subject-label">当前科目</text>
          <text class="subject-value">
            {{ resolvedSubjectName || "请选择科目" }}
          </text>
        </view>
        <view class="subject-meta">
          <text class="subject-code" v-if="resolvedSubjectCode">
            {{ resolvedSubjectCode }}
          </text>
          <u-icon name="arrow-down-fill" size="16" color="#f48c42"></u-icon>
        </view>
      </view>

      <view class="insight-card">
        <view class="insight-title">智能题库分析</view>
        <view class="insight-subtitle">
          基于 AI 对
          {{ resolvedSubjectName || "目标科目" }} 的考点走势分析
        </view>
        <view class="insight-stats">
          <view class="stat-card" v-for="item in summaryCards" :key="item.label">
            <text class="stat-label">{{ item.label }}</text>
            <text class="stat-value">
              {{ item.value }}<text class="stat-suffix">{{ item.suffix }}</text>
            </text>
          </view>
        </view>
      </view>

      <view class="bank-section">
        <view class="section-header">
          <view>
            <text class="section-title">精选题集</text>
            <text class="section-subtitle">
              {{ resolvedSubjectName || "AI" }} 智能匹配题库
            </text>
          </view>
          <view class="refresh-tip" @click="regenerateBanks">
            <u-icon name="reload" color="#f48c42" size="18"></u-icon>
            <text>智能重排</text>
          </view>
        </view>

        <view
          class="bank-card"
          v-for="bank in aiBanks"
          :key="bank.id"
          @click="startPractice(bank)"
        >
          <view class="bank-head">
            <view class="bank-tag" :style="bank.tagStyle">{{ bank.tag }}</view>
            <view class="bank-level">{{ bank.difficulty }}</view>
          </view>
          <view class="bank-title">{{ bank.title }}</view>
          <view class="bank-desc">{{ bank.displayDesc }}</view>
          <view class="bank-meta">
            <view class="meta-item">
              <text class="meta-label">题量</text>
              <text class="meta-value">{{ bank.questionCount }}题</text>
            </view>
            <view class="meta-item">
              <text class="meta-label">命中率</text>
              <text class="meta-value">{{ bank.accuracy }}%</text>
            </view>
            <view class="meta-item">
              <text class="meta-label">AI模型</text>
              <text class="meta-value">{{ bank.model }}</text>
            </view>
          </view>
          <view class="bank-actions">
            <view class="progress-line">
              <view class="progress-inner" :style="{ width: bank.progress + '%' }"></view>
            </view>
            <text class="progress-text">覆盖 {{ bank.coverage }}% 知识点</text>
            <view class="start-btn">
              <text>立即开启</text>
              <u-icon name="arrow-right" color="#fff" size="14"></u-icon>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import * as SubjectApi from "@/api/subjectUser";

const TAG_STYLES = {
  高频考点: { background: "#fff3e8", color: "#f37335" },
  冲刺提升: { background: "#e8f6ff", color: "#0070c9" },
  基础巩固: { background: "#f3f0ff", color: "#6c4ddc" },
  智能诊断: { background: "#e7f7f0", color: "#1ba784" },
};

const BASE_BANKS = [
  {
    id: "core",
    title: "核心考点精炼",
    difficulty: "中等",
    tag: "高频考点",
    questionCount: 45,
    accuracy: 82,
    model: "Atlas-3",
    progress: 68,
    coverage: 65,
    description: "{subject}考试高频考点集中练习，覆盖历年错题与易混概念。",
  },
  {
    id: "sprint",
    title: "冲刺押题套卷",
    difficulty: "进阶",
    tag: "冲刺提升",
    questionCount: 60,
    accuracy: 88,
    model: "Atlas-3 Turbo",
    progress: 72,
    coverage: 74,
    description: "AI 综合命题趋势，为 {subject} 考生推送临考冲刺题集。",
  },
  {
    id: "foundation",
    title: "基础巩固训练",
    difficulty: "基础",
    tag: "基础巩固",
    questionCount: 35,
    accuracy: 76,
    model: "Atlas-2.5",
    progress: 54,
    coverage: 58,
    description: "夯实 {subject} 核心概念，适合快速复盘知识点。",
  },
  {
    id: "diagnose",
    title: "AI诊断推荐",
    difficulty: "个性化",
    tag: "智能诊断",
    questionCount: 40,
    accuracy: 85,
    model: "Atlas-3",
    progress: 63,
    coverage: 61,
    description: "根据近期练习表现推荐题目，即时修补 {subject} 薄弱环节。",
  },
];

export default {
  components: {
    Navbar,
  },
  data() {
    return {
      subjectList: [],
      currentSubject: null,
      aiBanks: [],
      isLoading: false,
      subjectCode: "",
    };
  },
  onLoad(options) {
    if (options?.subjectCode) {
      this.subjectCode = options.subjectCode;
    }
    this.fetchSubjects();
  },
  computed: {
    resolvedSubjectName() {
      return this.currentSubject ? this.currentSubject.subjectName : "";
    },
    resolvedSubjectCode() {
      return this.currentSubject ? this.currentSubject.subjectCode : "";
    },
    summaryCards() {
      if (!this.aiBanks.length) {
        return [
          { label: "题量覆盖", value: "--", suffix: "" },
          { label: "平均命中率", value: "--", suffix: "" },
          { label: "进阶题集", value: "--", suffix: "" },
        ];
      }
      const totalQuestions = this.aiBanks.reduce((sum, bank) => sum + bank.questionCount, 0);
      const avgAccuracy = Math.round(
        this.aiBanks.reduce((sum, bank) => sum + bank.accuracy, 0) / this.aiBanks.length
      );
      const advancedCount = this.aiBanks.filter((bank) => bank.difficulty !== "基础").length;
      return [
        { label: "题量覆盖", value: totalQuestions, suffix: "题" },
        { label: "平均命中率", value: avgAccuracy, suffix: "%" },
        { label: "进阶题集", value: advancedCount, suffix: "套" },
      ];
    },
  },
  methods: {
    async fetchSubjects() {
      this.isLoading = true;
      try {
        const res = await SubjectApi.getSubject();
        this.subjectList = res?.data?.subjects || [];
        if (this.subjectList.length) {
          const matched = this.subjectList.find(
            (item) => item.subjectCode === this.subjectCode
          );
          this.setSubject(matched || this.subjectList[0]);
        } else {
          this.setSubject(null);
        }
      } catch (error) {
        console.error("获取科目列表失败:", error);
        this.setSubject(null);
        uni.showToast({
          title: "科目加载失败",
          icon: "none",
        });
      } finally {
        this.isLoading = false;
      }
    },
    setSubject(subject) {
      this.currentSubject = subject;
      this.subjectCode = subject?.subjectCode || "";
      this.generateBanks();
    },
    chooseSubject() {
      if (this.isLoading) {
        return;
      }
      if (!this.subjectList.length) {
        uni.showToast({
          title: "暂无可选科目",
          icon: "none",
        });
        return;
      }
      uni.showActionSheet({
        itemList: this.subjectList.map((item) => item.subjectName),
        success: (res) => {
          const selected = this.subjectList[res.tapIndex];
          this.setSubject(selected);
        },
      });
    },
    generateBanks() {
      const subjectName = this.resolvedSubjectName || "该科目";
      this.aiBanks = BASE_BANKS.map((bank) => {
        const tagStyle = TAG_STYLES[bank.tag] || {
          background: "#f2f2f2",
          color: "#666666",
        };
        return {
          ...bank,
          displayDesc: bank.description.replace("{subject}", subjectName),
          tagStyle,
        };
      });
    },
    regenerateBanks() {
      if (!this.aiBanks.length) {
        return;
      }
      // 预留智能排序接口，当前做简单的前后切换
      this.aiBanks = [...this.aiBanks.slice(1), this.aiBanks[0]];
    },
    startPractice(bank) {
      uni.showToast({
        title: `《${bank.title}》敬请期待`,
        icon: "none",
        duration: 1800,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.ai-bank-page {
  min-height: 100vh;
  background: #f7f7fb;
  display: flex;
  flex-direction: column;
}

.ai-bank-body {
  padding: 20px 16px 30px;
}

.subject-panel {
  background: #ffffff;
  border-radius: 18px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 25px rgba(244, 140, 66, 0.15);
  margin-bottom: 16px;
  transition: transform 0.2s ease;

  &.disabled {
    opacity: 0.6;
  }

  &:active {
    transform: scale(0.98);
  }
}

.subject-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.subject-label {
  font-size: 13px;
  color: #909399;
}

.subject-value {
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.subject-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.subject-code {
  font-size: 12px;
  color: #f48c42;
  background: rgba(244, 140, 66, 0.08);
  padding: 4px 8px;
  border-radius: 999px;
}

.insight-card {
  background: linear-gradient(135deg, #f37335, #fdc830);
  border-radius: 24px;
  padding: 20px;
  color: #ffffff;
  box-shadow: 0 12px 30px rgba(243, 115, 53, 0.4);
}

.insight-title {
  font-size: 18px;
  font-weight: 700;
}

.insight-subtitle {
  margin-top: 4px;
  font-size: 13px;
  opacity: 0.85;
}

.insight-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 18px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.8;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  display: inline-flex;
  align-items: flex-end;
  gap: 4px;
}

.stat-suffix {
  font-size: 12px;
  font-weight: 400;
  margin-left: 2px;
}

.bank-section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2f3d;
  display: block;
}

.section-subtitle {
  font-size: 12px;
  color: #909399;
}

.refresh-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #f48c42;
  background: rgba(244, 140, 66, 0.1);
  padding: 6px 12px;
  border-radius: 999px;
}

.bank-card {
  background: #ffffff;
  border-radius: 22px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 15px 35px rgba(15, 18, 40, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: translateY(2px);
    box-shadow: 0 8px 20px rgba(15, 18, 40, 0.08);
  }
}

.bank-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.bank-tag {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.bank-level {
  font-size: 13px;
  color: #999;
  padding: 4px 10px;
  background: #f5f7fa;
  border-radius: 999px;
}

.bank-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2d3d;
}

.bank-desc {
  font-size: 13px;
  color: #606266;
  margin-top: 6px;
  line-height: 1.4;
}

.bank-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  padding: 12px;
  background: #f8f9fb;
  border-radius: 14px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  color: #909399;
}

.meta-value {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
}

.bank-actions {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-line {
  height: 6px;
  background: #f0f2f5;
  border-radius: 999px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #f37335, #fdc830);
  border-radius: 999px;
}

.progress-text {
  font-size: 12px;
  color: #909399;
}

.start-btn {
  align-self: flex-start;
  background: linear-gradient(135deg, #f48c42, #f37335);
  border-radius: 999px;
  padding: 8px 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 10px 20px rgba(243, 115, 53, 0.25);
}
</style>
