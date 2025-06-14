<template>
  <view class="container">
    <u-navbar title="错题本" :autoBack="true" fixed placeholder></u-navbar>

    <!-- 科目筛选 -->
    <view class="filter-bar">
      <u-tabs
        :list="subjectList"
        :current="currentTab"
        @change="changeTab"
        lineColor="#4A90E2"
        :activeStyle="{ color: '#303133', fontWeight: 'bold' }"
        :inactiveStyle="{ color: '#606266' }"
      ></u-tabs>
    </view>

    <view class="empty-state" v-if="filteredWrongQuestions.length === 0">
      <u-empty mode="data" icon="error-circle" text="暂无错题记录"></u-empty>
      <view class="tips">当前科目下没有错题哦~</view>
    </view>

    <view class="question-list" v-else>
      <view
        class="question-item"
        v-for="item in filteredWrongQuestions"
        :key="item.id"
        @click="viewQuestion(item)"
      >
        <view class="question-body">
          <view class="question-type-badge">{{
            getQuestionTypeName(item.questionType).charAt(0)
          }}</view>
          <rich-text :nodes="item.questionName" class="question-content"></rich-text>
        </view>
        <view class="question-footer">
          <view class="info-tags">
            <view class="tag-item subject-tag">{{ item.subjectName || "未知科目" }}</view>
            <view class="tag-item time-tag">{{ formatTime(item.createTime) }}</view>
          </view>
          <view class="action-buttons">
            <view class="action-btn" @click.stop="viewAnalysis(item)">
              <u-icon name="eye" size="18"></u-icon>
              <text>解析</text>
            </view>
            <view class="action-btn remove-btn" @click.stop="removeFromWrong(item.id)">
              <u-icon name="trash" size="18"></u-icon>
              <text>移除</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <u-loadmore
      :status="loadMoreStatus"
      v-if="filteredWrongQuestions.length > 0 && wrongQuestions.length < total"
    />
  </view>
</template>

<script>
export default {
  data() {
    return {
      wrongQuestions: [],
      page: 1,
      limit: 10,
      total: 0,
      loadMoreStatus: "loading", // loading, nomore, loadmore
      questionTypeMap: {
        1: "单选题",
        2: "多选题",
        3: "判断题",
        4: "填空题",
        5: "简答题",
      },
      subjectList: [
        { name: "全部" },
        { name: "物理" },
        { name: "化学" },
        { name: "数学" },
        { name: "生物" },
        { name: "电子技术" },
      ],
      currentTab: 0,
    };
  },
  computed: {
    filteredWrongQuestions() {
      if (this.currentTab === 0) {
        return this.wrongQuestions;
      }
      const currentSubject = this.subjectList[this.currentTab].name;
      return this.wrongQuestions.filter((q) => q.subjectName === currentSubject);
    },
  },
  onLoad() {
    this.getWrongQuestions();
  },
  onReachBottom() {
    if (this.wrongQuestions.length < this.total) {
      this.page++;
      this.getWrongQuestions();
    } else {
      this.loadMoreStatus = "nomore";
    }
  },
  methods: {
    changeTab(item) {
      this.currentTab = item.index;
    },
    async getWrongQuestions() {
      try {
        if (this.loadMoreStatus === "nomore") return;
        uni.showLoading({ title: "加载中..." });
        this.loadMoreStatus = "loading";

        // 使用演示数据替代API调用
        setTimeout(() => {
          const demoData = {
            code: 200,
            rows: [
              {
                id: 1001,
                questionType: 1,
                questionName: "下列关于力的描述中，正确的是（ ）",
                subjectName: "物理",
                createTime: new Date().getTime() - 24 * 60 * 60 * 1000,
              },
              {
                id: 1002,
                questionType: 2,
                questionName: "下列元素中，属于非金属元素的是（ ）",
                subjectName: "化学",
                createTime: new Date().getTime() - 2 * 24 * 60 * 60 * 1000,
              },
              {
                id: 1003,
                questionType: 3,
                questionName: "牛顿第一定律又称为惯性定律。（ ）",
                subjectName: "物理",
                createTime: new Date().getTime() - 3 * 24 * 60 * 60 * 1000,
              },
              {
                id: 1004,
                questionType: 4,
                questionName: "在△ABC中，角A=30°，角B=60°，则角C=________。",
                subjectName: "数学",
                createTime: new Date().getTime() - 5 * 24 * 60 * 60 * 1000,
              },
              {
                id: 1005,
                questionType: 5,
                questionName: "简述光合作用的过程及其重要性。",
                subjectName: "生物",
                createTime: new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
              },
              {
                id: 1006,
                questionType: 1,
                questionName:
                  '<p>已知：log<sub>a</sub>b=m，log<sub>b</sub>c=n，求log<sub>a</sub>c的值。</p>',
                subjectName: "数学",
                createTime: new Date().getTime() - 8 * 24 * 60 * 60 * 1000,
              },
              {
                id: 1007,
                questionType: 2,
                questionName: "下列关于等效电路的说法中，正确的有（ ）",
                subjectName: "电子技术",
                createTime: new Date().getTime() - 10 * 24 * 60 * 60 * 1000,
              },
              {
                id: 1008,
                questionType: 3,
                questionName: "在理想气体状态方程中，压强与体积成正比。（ ）",
                subjectName: "化学",
                createTime: new Date().getTime() - 12 * 24 * 60 * 60 * 1000,
              },
            ],
            total: 15,
          };

          const newQuestions = this.page > 1 ? demoData.rows.slice(0, 7) : demoData.rows;

          if (this.page === 1) {
            this.wrongQuestions = newQuestions;
          } else {
            this.wrongQuestions = [...this.wrongQuestions, ...newQuestions];
          }

          this.total = demoData.total;

          if (this.wrongQuestions.length >= this.total) {
            this.loadMoreStatus = "nomore";
          } else {
            this.loadMoreStatus = "loadmore";
          }

          uni.hideLoading();
        }, 500);
      } catch (error) {
        console.error("获取错题列表失败", error);
        uni.showToast({
          title: "获取错题列表失败",
          icon: "none",
        });
        this.loadMoreStatus = "loadmore";
        uni.hideLoading();
      }
    },
    getQuestionTypeName(type) {
      return this.questionTypeMap[type] || "未知";
    },
    formatTime(time) {
      if (!time) return "";
      const date = new Date(time);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    },
    viewQuestion(question) {
      // 实际应跳转到题目详情页
      console.log("View question", question.id);
    },
    viewAnalysis(question) {
      // 实际应跳转到解析页
      console.log("View analysis", question.id);
    },
    async removeFromWrong(id) {
      if (!id) return;

      uni.showModal({
        title: "提示",
        content: "确定要从错题本中移除此题目吗？",
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({ title: "处理中..." });

            setTimeout(() => {
              this.wrongQuestions = this.wrongQuestions.filter((q) => q.id !== id);
              this.total--;
              uni.hideLoading();
              uni.showToast({
                title: "移除成功",
                icon: "success",
              });
              if (this.wrongQuestions.length < this.total) {
                this.loadMoreStatus = "loadmore";
              }
            }, 500);
          }
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.filter-bar {
  background-color: #fff;
}

.empty-state {
  padding-top: 200rpx;
  text-align: center;

  .tips {
    margin-top: 20rpx;
    color: #909399;
    font-size: 26rpx;
  }
}

.question-list {
  padding: 24rpx;
}

.question-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease-in-out;

  &:active {
    transform: scale(0.98);
    background-color: #fafafa;
  }
}

.question-body {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.question-type-badge {
  flex-shrink: 0;
  width: 48rpx;
  height: 48rpx;
  background-image: linear-gradient(135deg, #4a90e2 0%, #007aff 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24rpx;
  font-weight: bold;
}

.question-content {
  flex-grow: 1;
  font-size: 30rpx;
  line-height: 1.6;
  color: #303133;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
}

.info-tags {
  display: flex;
  align-items: center;
  gap: 16rpx;
  font-size: 24rpx;

  .tag-item {
    padding: 6rpx 16rpx;
    border-radius: 20rpx;
  }

  .subject-tag {
    background-color: #eef2f8;
    color: #4a90e2;
  }

  .time-tag {
    color: #909399;
  }
}

.action-buttons {
  display: flex;
  gap: 30rpx;

  .action-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 26rpx;
    color: #606266;

    &.remove-btn {
      color: #fa3534;
    }
  }
}
</style>
