<template>
  <view class="my-questions">
    <Navbar
      title="我的题库"
      bgColor="#4ECDB6"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></Navbar>

    <!-- 导入题库按钮 -->
    <view class="import-section">
      <u-button
        type="primary"
        @click="handleImport"
        icon="plus"
        text="导入题库"
        :customStyle="{
          width: '100%',
          height: '45px',
          background: 'linear-gradient(to right, #4ECDB6, #45BFA3)',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '500',
          boxShadow: '0 2px 6px rgba(78, 205, 182, 0.2)',
        }"
      ></u-button>
    </view>

    <!-- 题库列表 -->
    <view class="question-banks">
      <view class="section-title">已导入题库</view>
      <view v-if="questionBanks.length === 0" class="empty-tip">
        <u-empty mode="data" text="暂无导入的题库"></u-empty>
      </view>
      <view v-else class="bank-list">
        <view
          v-for="(bank, index) in questionBanks"
          :key="index"
          class="bank-item"
          @click="viewBankDetail(bank.id)"
        >
          <view class="bank-info">
            <text class="bank-name">{{ bank.name }}</text>
            <text class="question-count">{{ bank.questionCount }}题</text>
          </view>
          <u-icon name="arrow-right" color="#999" size="16"></u-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";

export default {
  components: {
    Navbar,
  },
  data() {
    return {
      questionBanks: [], // 题库列表
    };
  },
  onShow() {
    this.loadQuestionBanks();
  },
  methods: {
    // 加载题库列表
    async loadQuestionBanks() {
      // TODO: 从API获取题库列表
      this.questionBanks = [
        { id: 1, name: "2023年真题", questionCount: 100 },
        { id: 2, name: "模拟试题集", questionCount: 200 },
      ];
    },
    // 处理导入题库
    handleImport() {
      // 生成导入链接
      const baseUrl =
        process.env.NODE_ENV === "production"
          ? window.location.origin
          : "http://localhost:8080";

      const importUrl = `${baseUrl}/import-questions`;

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
    },
    // 查看题库详情
    viewBankDetail(bankId) {
      uni.navigateTo({
        url: `/pages/my-questions/bank-detail?id=${bankId}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.my-questions {
  min-height: 100vh;
  background-color: #f5f6fa;
  padding-bottom: 30px;
}

.import-section {
  margin: 20px 15px;
  .u-button {
    &:active {
      transform: scale(0.98);
      transition: transform 0.2s;
    }
  }
}

.question-banks {
  margin: 20px 15px;

  .section-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
  }

  .bank-list {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
  }

  .bank-item {
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background-color: #f9f9f9;
    }
  }

  .bank-info {
    flex: 1;

    .bank-name {
      font-size: 15px;
      color: #333;
      margin-right: 10px;
    }

    .question-count {
      font-size: 13px;
      color: #999;
    }
  }
}

.empty-tip {
  padding: 40px 0;
}
</style>
