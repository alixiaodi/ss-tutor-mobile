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
      // 先选择文件
      uni.chooseFile({
        count: 1,
        extension: [".xlsx", ".xls"],
        success: (res) => {
          // 弹出输入框让用户输入题库名称
          uni.showModal({
            title: "请输入题库名称",
            editable: true,
            placeholderText: "例如：2024年模拟题",
            success: async (modalRes) => {
              if (modalRes.confirm && modalRes.content) {
                // 显示上传中
                uni.showLoading({
                  title: "导入中...",
                });

                try {
                  // TODO: 调用上传API
                  const formData = new FormData();
                  formData.append("file", res.tempFilePaths[0]);
                  formData.append("name", modalRes.content);

                  // const result = await uploadQuestionBank(formData);

                  // 刷新题库列表
                  this.loadQuestionBanks();

                  uni.showToast({
                    title: "导入成功",
                    icon: "success",
                  });
                } catch (error) {
                  uni.showToast({
                    title: "导入失败",
                    icon: "error",
                  });
                } finally {
                  uni.hideLoading();
                }
              }
            },
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
