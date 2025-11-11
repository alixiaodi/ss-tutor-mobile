<template>
  <view class="container">
    <Navbar
      title="错题本"
      bgColor="#f48c42"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></Navbar>

    <!-- 科目筛选 -->
    <view class="filter-bar">
      <u-tabs
        :list="subjectList"
        :current="currentTab"
        @change="changeTab"
        scrollable
        keyName="subjectName"
        lineColor="#4A90E2"
        :lineHeight="3"
        :lineWidth="30"
        :activeStyle="{ color: '#303133', fontWeight: 'bold' }"
        :inactiveStyle="{ color: '#606266' }"
        itemStyle="padding-left: 15px; padding-right: 15px; padding-bottom: 8px; white-space: nowrap;"
      ></u-tabs>
    </view>

    <view class="content-wrapper">
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
        <view class="question-meta" v-if="Number(item.wrongCount) > 0">
          <view class="wrong-count-chip">
            错 {{ item.wrongCount }} 次
          </view>
        </view>
        <view class="question-body">
          <rich-text :nodes="item.questionName" class="question-content"></rich-text>
        </view>
        <view class="question-footer">
          <view class="action-buttons">
            <view class="action-btn" @click.stop="viewAnalysis(item)">
              <u-icon name="eye" size="18"></u-icon>
              <text>详情</text>
            </view>
            <view class="action-btn remove-btn" @click.stop="removeFromWrong(item.id)">
              <u-icon name="trash" size="18"></u-icon>
              <text>移除</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view
      class="scroll-top-btn"
      v-if="showScrollTop"
      @click.stop="scrollToTop"
    >
      <u-icon name="arrow-up" size="20" color="#fff"></u-icon>
      <text>回到顶部</text>
    </view>

    <u-loadmore
      :status="loadMoreStatus"
      v-if="filteredWrongQuestions.length > 0 && wrongQuestions.length < total"
    />
    </view>
  </view>
</template>

<script>
import * as SubjectApi from "@/api/subjectUser";
import * as WrongQuestionApi from "@/api/wrongQuestion";
import Navbar from "@/components/navbar/Navbar";

export default {
  components: {
    Navbar,
  },
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
      subjectList: [],
      currentTab: 0,
      showScrollTop: false,
    };
  },
  computed: {
    filteredWrongQuestions() {
      if (!this.subjectList.length || !this.subjectList[this.currentTab]) {
        return this.wrongQuestions;
      }
      const currentSubject = this.subjectList[this.currentTab].subjectName;
      return this.wrongQuestions.filter((q) => q.subjectName === currentSubject);
    },
  },
  onLoad() {
    this.loadSubjectData();
  },
  onReachBottom() {
    if (this.wrongQuestions.length < this.total) {
      this.page++;
      this.getWrongQuestions();
    } else {
      this.loadMoreStatus = "nomore";
    }
  },
  onPageScroll(e) {
    this.showScrollTop = e.scrollTop > 200;
  },
  methods: {
    async loadSubjectData() {
      try {
        const res = await SubjectApi.getSubject();
        if (res.data && res.data.subjects) {
          this.subjectList = res.data.subjects;
          if (this.subjectList.length) {
            this.currentTab = 0;
            this.resetWrongQuestionState();
            await this.getWrongQuestions();
          }
        }
      } catch (error) {
        console.error("获取科目列表失败", error);
      }
    },
    resetWrongQuestionState() {
      this.page = 1;
      this.total = 0;
      this.wrongQuestions = [];
      this.loadMoreStatus = "loading";
    },
    changeTab(item) {
      this.currentTab = item.index;
      this.resetWrongQuestionState();
      this.getWrongQuestions();
    },
    async getWrongQuestions() {
      try {
        if (this.loadMoreStatus === "nomore") return;
        const currentSubject = this.subjectList[this.currentTab];
        if (!currentSubject || !currentSubject.subjectCode) {
          this.wrongQuestions = [];
          this.total = 0;
          this.loadMoreStatus = "nomore";
          return;
        }

        uni.showLoading({ title: "加载中..." });
        this.loadMoreStatus = "loading";

        const params = {
          pageNum: this.page,
          pageSize: this.limit,
          subjectCode: currentSubject.subjectCode,
        };

        const res = await WrongQuestionApi.getWrongQuestionList(params);
        const pageData = res?.data && typeof res.data === "object" ? res.data : null;
        const listSource = Array.isArray(pageData?.records)
          ? pageData.records
          : Array.isArray(res.rows)
          ? res.rows
          : Array.isArray(res.data)
          ? res.data
          : [];
        const list = listSource.map((item) => ({
          ...item,
          subjectName: item.subjectName || currentSubject.subjectName || "",
        }));

        if (this.page === 1) {
          this.wrongQuestions = list;
        } else {
          this.wrongQuestions = [...this.wrongQuestions, ...list];
        }

        const totalFromResponse =
          typeof pageData?.total === "number"
            ? pageData.total
            : typeof res.total === "number"
            ? res.total
            : Array.isArray(res.data)
            ? res.data.length
            : this.wrongQuestions.length;
        const pageSizeFromResponse =
          typeof pageData?.size === "number" ? pageData.size : this.limit;

        this.total = totalFromResponse;

        if (
          this.wrongQuestions.length >= this.total ||
          list.length < pageSizeFromResponse
        ) {
          this.loadMoreStatus = "nomore";
        } else {
          this.loadMoreStatus = "loadmore";
        }
      } catch (error) {
        console.error("获取错题列表失败", error);
        uni.showToast({
          title: "获取错题列表失败",
          icon: "none",
        });
        if (this.page > 1) {
          this.page -= 1;
        }
        this.loadMoreStatus = "loadmore";
      } finally {
        uni.hideLoading();
      }
    },
    getQuestionTypeName(type) {
      return this.questionTypeMap[type] || "未知";
    },
    viewQuestion(question) {
      // 实际应跳转到题目详情页
      console.log("View question", question.id);
    },
    viewAnalysis(question) {
      const query = [];
      const detailId = question?.id || question?.questionId;
      const questionId = question?.questionId || question?.id;
      if (detailId) {
        query.push(`id=${detailId}`);
      }
      if (questionId) {
        query.push(`questionId=${questionId}`);
      }
      if (question?.questionName) {
        query.push(`questionName=${encodeURIComponent(question.questionName)}`);
      }
      if (question?.questionAnswer) {
        query.push(`questionAnswer=${encodeURIComponent(question.questionAnswer)}`);
      }
      if (question?.subjectName) {
        query.push(`subjectName=${encodeURIComponent(question.subjectName)}`);
      }

      const queryString = query.length ? `?${query.join("&")}` : "";
      uni.navigateTo({
        url: `/pages/wrong/detail${queryString}`,
      });
    },
    scrollToTop() {
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 300,
      });
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
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  padding: 20rpx 0;
}

.content-wrapper {
  min-height: calc(100vh - 88px);
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
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease-in-out;

  &:active {
    transform: scale(0.98);
    background-color: #fafafa;
  }
}

.question-meta {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 24rpx;
  color: #8c9aa3;
}

.wrong-count-chip {
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(244, 140, 66, 0.15);
  color: #f48c42;
  font-size: 24rpx;
}

.question-body {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
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
  justify-content: flex-end;
  align-items: center;
  padding-top: 20rpx;
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

.scroll-top-btn {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background-image: linear-gradient(135deg, #4a90e2, #4285f4);
  color: #fff;
  padding: 20rpx 26rpx;
  border-radius: 999rpx;
  box-shadow: 0 12rpx 24rpx rgba(66, 133, 244, 0.35);
  font-size: 26rpx;
  z-index: 120;
}
</style>
