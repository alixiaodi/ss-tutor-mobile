<template>
  <view class="my-questions">
    <Navbar
      title="我的题库"
      bgColor="#4ECDB6"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 600;"
    ></Navbar>

    <!-- 标题区域 -->
    <view class="header-section">
      <text class="total-count">共{{ questionBanks.length }}个题库</text>
    </view>

    <!-- 导入题库按钮 -->
    <view class="import-section">
      <u-button
        type="primary"
        @click="handleImport"
        icon="plus"
        text="导入题库"
        :customStyle="{
          width: '100%',
          height: '48px',
          background: 'linear-gradient(135deg, #4ECDB6, #45BFA3)',
          borderRadius: '12px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(78, 205, 182, 0.25)',
        }"
      ></u-button>
    </view>

    <!-- 题库列表 -->
    <view class="question-banks">
      <view class="section-title">已导入题库</view>
      <view v-if="questionBanks.length === 0" class="empty-tip">
        <u-empty mode="data" text="暂无导入的题库" :icon-size="120" marginTop="60">
          <view class="empty-desc">点击上方按钮开始导入题库吧</view>
        </u-empty>
      </view>
      <view v-else class="bank-list">
        <view
          v-for="(bank, index) in questionBanks"
          :key="index"
          class="bank-item"
          @click="viewBankDetail(bank.id)"
          :class="{
            'last-item': index === questionBanks.length - 1,
            'bank-item-active': bank.id === lastBankId,
          }"
        >
          <view class="bank-info">
            <view class="left-info">
              <text class="bank-name">{{ bank.name }}</text>
              <text class="question-count">{{ bank.questionCount }}题</text>
            </view>
            <text class="create-time">{{ bank.createTime }}</text>
          </view>
          <u-icon name="arrow-right" color="#BDBDBD" size="18"></u-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import * as MyQuestionsApi from "@/api/myQuestions";
import * as StageContentsApi from "@/api/stageContents";
import * as AnswerQuestionsApi from "@/api/answerQuestions";

export default {
  components: {
    Navbar,
  },
  data() {
    return {
      questionBanks: [], // 题库列表
      subjectCode: "", // 科目代码
      lastBankId: "", // 上一次练习的题库ID
    };
  },
  onLoad(options) {
    if (options.subjectCode) {
      this.subjectCode = options.subjectCode;
      // 获取本地存储的上一次练习题库
      this.lastBankId = uni.getStorageSync(`lastBankId_${this.subjectCode}`) || "";
    }
  },
  onShow() {
    this.loadQuestionBanks();
  },
  methods: {
    // 加载题库列表
    async loadQuestionBanks() {
      if (!this.subjectCode) {
        uni.showToast({
          title: "缺少科目参数",
          icon: "none",
        });
        return;
      }
      try {
        const res = await MyQuestionsApi.getMyQuestionList(this.subjectCode);
        this.questionBanks = res.data || [];
      } catch (error) {
        console.error("获取题库列表失败:", error);
        uni.showToast({
          title: "获取题库列表失败",
          icon: "none",
        });
        this.questionBanks = [];
      }
    },
    // 处理导入题库
    handleImport() {
      if (!this.subjectCode) {
        uni.showToast({
          title: "缺少科目参数",
          icon: "none",
        });
        return;
      }
      // 调用生成导入链接API
      MyQuestionsApi.generateImportLink(this.subjectCode)
        .then((res) => {
          const importUrl = res.data;
          // 复制链接到剪贴板
          uni.setClipboardData({
            data: importUrl,
            success: () => {
              uni.showModal({
                title: "链接已复制",
                content:
                  "请在电脑浏览器中打开链接，上传Excel格式的题库文件。\n\n支持.xlsx和.xls格式",
                confirmText: "我知道了",
                showCancel: false,
                confirmColor: "#4ECDB6",
              });
            },
          });
        })
        .catch((err) => {
          console.error("生成导入链接失败:", err);
          uni.showToast({
            title: "生成导入链接失败",
            icon: "none",
          });
        });
    },
    // 查看题库详情
    async viewBankDetail(bankId) {
      try {
        // 存储当前选择的题库到本地
        uni.setStorageSync(`lastBankId_${this.subjectCode}`, bankId);
        this.lastBankId = bankId;

        // 先获取最后一次答题记录
        const lastRecord = await StageContentsApi.getLastAnswerRecord(bankId);

        if (lastRecord.data) {
          // 继续上次的答题
          uni.navigateTo({
            url: `/pages/past-papers/exam?id=${bankId}&mode=5&answerId=${lastRecord.data}`,
          });
        } else {
          // 没有未完成的记录，直接创建新的
          this.createNewAnswer(bankId);
        }
      } catch (error) {
        console.error("获取答题记录失败:", error);
        uni.showToast({
          title: "获取答题记录失败",
          icon: "none",
        });
      }
    },

    // 创建新的答题记录
    createNewAnswer(bankId) {
      AnswerQuestionsApi.add({
        paperId: bankId,
        type: "5", // 练习模式
      })
        .then((res) => {
          // 跳转到答题页面
          uni.navigateTo({
            url: `/pages/past-papers/exam?id=${bankId}&mode=5&answerId=${res.data}`,
          });
        })
        .catch((error) => {
          console.error("创建答题记录失败:", error);
          uni.showToast({
            title: "创建答题记录失败",
            icon: "none",
          });
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.my-questions {
  min-height: 100vh;
  background-color: #f8f9fd;
  padding-bottom: 40px;
}

.header-section {
  padding: 15px 20px 0;
  .total-count {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
}

.import-section {
  margin: 24px 20px;
  .u-button {
    transition: all 0.3s ease;
    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }
}

.question-banks {
  margin: 24px 20px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    letter-spacing: 0.5px;
  }

  .bank-list {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    overflow: hidden;
  }

  .bank-item {
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.2s ease;
    position: relative;

    &.last-item {
      border-bottom: none;
    }

    &.bank-item-active {
      background-color: #f0faf8;

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 8rpx;
        background-color: #4ecdb6;
      }
    }

    &:active {
      background-color: #fafafa;
      transform: translateX(4px);
    }
  }

  .bank-info {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .left-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .bank-name {
        font-size: 16px;
        color: #2c3e50;
        font-weight: 500;
      }

      .question-count {
        font-size: 13px;
        color: #4ecdb6;
        background: rgba(78, 205, 182, 0.1);
        padding: 2px 8px;
        border-radius: 10px;
      }
    }

    .create-time {
      font-size: 14px;
      color: #999;
    }
  }
}

.empty-tip {
  padding: 60px 0;
  text-align: center;

  .empty-desc {
    margin-top: 12px;
    font-size: 14px;
    color: #999;
  }
}
</style>
