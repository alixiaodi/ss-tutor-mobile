<template>
  <view class="stage-practice">
    <Navbar
      title="阶段练习"
      bgColor="#f48c42"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></Navbar>

    <!-- 阶段选择区域 -->
    <view class="stage-selector">
      <scroll-view scroll-x="true" class="scroll-view">
        <u-tabs
          :list="stageList"
          :current="currentStage"
          @change="handleStageChange"
          activeStyle="color: #f48c42; font-weight: bold;"
          inactiveStyle="color: #666;"
          lineColor="#f48c42"
          :lineWidth="20"
          :scrollable="true"
          :scrollWithAnimation="true"
          itemStyle="padding-left: 15px; padding-right: 15px; height: 34px; white-space: nowrap; min-width: 80px;"
        ></u-tabs>
      </scroll-view>
    </view>

    <!-- 练习内容区域 -->
    <view class="practice-content">
      <view v-if="practiceList.length === 0" class="empty-tip">
        <u-empty mode="data" text="暂无练习内容"></u-empty>
      </view>
      <view v-else class="practice-list">
        <view v-for="(item, index) in practiceList" :key="index" class="practice-item">
          <view class="practice-info">
            <view class="practice-title">
              <text>{{ item.title }}</text>
            </view>
            <view class="practice-right">
              <text class="question-count">{{ item.questionCount }}题</text>
            </view>
          </view>
          <view class="practice-progress">
            <view class="progress-text">
              <text>已完成 {{ item.finishedCount }}/{{ item.questionCount }}题</text>
              <text class="progress-percent">{{ item.progressPercent }}%</text>
            </view>
            <u-line-progress
              :percentage="item.progressPercent"
              height="6"
              :showText="false"
              activeColor="#f48c42"
            ></u-line-progress>
          </view>
          <view class="practice-button">
            <u-button
              type="primary"
              text="开始练习"
              size="mini"
              :customStyle="{
                height: '32px',
                background: '#f48c42',
                borderRadius: '16px',
                border: 'none',
                padding: '0 20px',
              }"
              @click="startPractice(item)"
            ></u-button>
          </view>
        </view>
      </view>

      <!-- VIP按钮 -->
      <view v-if="needVip" class="vip-btn" @click="showVipPopup = true">
        <u-icon name="vip" size="32" color="#FFB800" class="vip-icon"></u-icon>
        <text>开通VIP查看更多</text>
      </view>
    </view>

    <vip-popup :show="showVipPopup" @update:show="showVipPopup = $event"></vip-popup>
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import VipPopup from "@/components/vip-popup/index.vue";
import * as StageContentsApi from "@/api/stageContents";
import * as AnswerQuestionsApi from "@/api/answerQuestions";

export default {
  components: {
    Navbar,
    VipPopup,
  },
  data() {
    return {
      currentStage: 0,
      stageList: [],
      practiceList: [],
      subjectCode: "",
      isLoading: false,
      isFirstLoad: true,
      showVipPopup: false,
      needVip: false,
    };
  },
  onLoad(options) {
    if (options.subjectCode) {
      this.subjectCode = options.subjectCode;
      // 获取上次选择的阶段
      const lastStageInfo = uni.getStorageSync("lastStageInfo");
      if (lastStageInfo && lastStageInfo.subjectCode === options.subjectCode) {
        this.currentStage = lastStageInfo.stageIndex;
      }
      this.loadStageContents();
    }
  },
  methods: {
    // 加载阶段内容
    loadStageContents() {
      if (this.isLoading) return;

      this.isLoading = true;
      StageContentsApi.getStageContents(this.subjectCode)
        .then((res) => {
          if (res.code === 200 && res.data) {
            // 处理返回的数据
            this.stageList = res.data.map((item) => ({
              name: item.name,
              id: item.id,
              children: item.children || [],
            }));

            // 如果有数据，显示记忆的阶段或第一个阶段
            if (this.stageList.length > 0) {
              // 确保currentStage不超过实际阶段数
              if (this.currentStage >= this.stageList.length) {
                this.currentStage = 0;
              }
              this.updatePracticeList(this.currentStage);
            }

            // 根据msg判断是否需要显示VIP按钮
            this.needVip = res.msg === 204;
          }
          this.isLoading = false;
          this.isFirstLoad = false;
        })
        .catch(() => {
          this.isLoading = false;
          this.isFirstLoad = false;
          uni.showToast({
            title: "获取数据失败",
            icon: "none",
          });
        });
    },
    // 处理阶段切换
    handleStageChange(e) {
      this.currentStage = e.index;
      // 保存选择的阶段到本地存储
      uni.setStorageSync("lastStageInfo", {
        subjectCode: this.subjectCode,
        stageIndex: e.index,
      });
      this.updatePracticeList(e.index);
    },
    // 更新练习列表
    updatePracticeList(index) {
      if (this.stageList[index]) {
        const currentStage = this.stageList[index];
        this.practiceList = (currentStage.children || []).map((child) => ({
          id: child.id,
          title: child.name,
          questionCount: child.questionCount || 0,
          finishedCount: Math.floor(
            ((child.questionCount || 0) * (child.progress || 0)) / 100
          ),
          progressPercent: child.progress || 0,
        }));
      } else {
        this.practiceList = [];
      }
    },
    // 开始练习
    async startPractice(item) {
      try {
        // 先获取最后一次答题记录
        const lastRecord = await StageContentsApi.getLastAnswerRecord(item.id);

        if (lastRecord.data) {
          // 继续上次的答题
          uni.navigateTo({
            url: `/pages/past-papers/exam?id=${item.id}&mode=5&answerId=${lastRecord.data}`,
          });
        } else {
          // 没有未完成的记录，直接创建新的
          this.createNewAnswer(item);
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
    createNewAnswer(item) {
      AnswerQuestionsApi.add({
        paperId: item.id,
        type: "5", // 修改为5表示练习模式
      })
        .then((res) => {
          // 跳转到答题页面
          uni.navigateTo({
            url: `/pages/past-papers/exam?id=${item.id}&mode=5&answerId=${res.data}`,
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
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        not_started: "未开始",
        in_progress: "进行中",
        completed: "已完成",
      };
      return statusMap[status] || "未开始";
    },
    // 开始全部练习
    startAllPractice() {
      if (this.practiceList.length === 0) {
        uni.showToast({
          title: "暂无练习内容",
          icon: "none",
        });
        return;
      }

      uni.navigateTo({
        url: `/pages/stage-practice/practice?id=${this.practiceList[0].id}&mode=all`,
      });
    },
  },
  onShow() {
    if (!this.isFirstLoad && this.subjectCode) {
      this.loadStageContents();
    }
  },
};
</script>

<style lang="scss" scoped>
.stage-practice {
  min-height: 100vh;
  background-color: #f5f6fa;
}

.stage-selector {
  background: #fff;
  padding: 12px 0;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);

  .scroll-view {
    width: 100%;
    white-space: nowrap;
  }

  :deep(.u-tabs__wrapper) {
    flex-wrap: nowrap;
    overflow-x: auto;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  :deep(.u-tabs__nav) {
    flex-wrap: nowrap;
    width: fit-content;
    min-width: 100%;
  }
}

.practice-content {
  padding: 0 15px;
  padding-bottom: 40rpx; // 为底部VIP按钮留出空间

  .vip-btn {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 48rpx;
    background: linear-gradient(90deg, #f9d499 0%, #e6b56d 100%);
    border-radius: 44rpx;
    box-shadow: 0 8rpx 16rpx rgba(230, 181, 109, 0.2);
    color: #543a1a;
    font-size: 32rpx;
    font-weight: 600;
    letter-spacing: 1px;
    margin-top: 40rpx;
    cursor: pointer;

    &:active {
      opacity: 0.9;
    }

    .vip-icon {
      margin-right: 12rpx;
    }

    text {
      line-height: 88rpx;
    }
  }
}

.practice-list {
  .practice-item {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      background-color: #fafafa;
    }
  }

  .practice-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .practice-title {
    text {
      font-size: 16px;
      color: #333;
      font-weight: 500;
    }
  }

  .practice-right {
    .question-count {
      font-size: 13px;
      color: #666;
      background: #f8f8f8;
      padding: 4px 12px;
      border-radius: 20px;
    }
  }

  .practice-progress {
    margin: 16px 0;
    padding: 0 2px;

    .progress-text {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 13px;
      color: #666;

      .progress-percent {
        color: #4ecdb6;
        font-weight: 500;
      }
    }
  }

  .practice-button {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}

.empty-tip {
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .empty-icon {
    margin-bottom: 40rpx;
  }

  .vip-btn {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 48rpx;
    background: linear-gradient(90deg, #f9d499 0%, #e6b56d 100%);
    border-radius: 44rpx;
    box-shadow: 0 8rpx 16rpx rgba(230, 181, 109, 0.2);
    color: #543a1a;
    font-size: 32rpx;
    font-weight: 600;
    letter-spacing: 1px;
    margin-top: 40rpx;
    cursor: pointer;

    &:active {
      opacity: 0.9;
    }

    .vip-icon {
      margin-right: 12rpx;
    }

    text {
      line-height: 88rpx;
    }
  }
}
</style>
