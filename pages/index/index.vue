<template>
  <view class="index-content">
    <view class="game-header">
      <!-- Left side: Player Info -->
      <view class="player-info" @click="selectSubject">
        <image src="/static/img/avatar.png" class="player-avatar"></image>
        <view class="player-stats">
          <view class="player-level-container">
            <text class="player-level">{{ examName ? examName : "选择挑战" }}</text>
            <u-icon name="arrow-down" size="14" color="#fff" class="select-icon"></u-icon>
          </view>
          <view class="xp-bar">
            <view class="xp-progress" style="width: 60%"></view>
          </view>
        </view>
      </view>

      <!-- Right side: Daily Quest -->
      <view class="daily-quest" @click="handleDailyQuestClick">
        <view class="quest-icon-wrapper">
          <image src="/static/img/quest_icon.png" class="quest-icon"></image>
        </view>
        <text class="quest-text">今日任务</text>
      </view>
    </view>

    <!-- 调整位置的 tabs -->
    <view class="content-container">
      <view class="tabs-container">
        <u-tabs
          :list="operationList"
          :current="currentIndex"
          @change="handleSelect"
          scrollable
          keyName="subjectName"
          activeStyle="color: #F39B78; font-weight: bold; transform: scale(1.05);"
          inactiveStyle="color: #666;"
          lineColor="#F39B78"
          itemStyle="padding-left: 15px; padding-right: 15px; padding-bottom: 8px; white-space: nowrap;"
          :lineHeight="3"
          :lineWidth="30"
        >
          <template #right>
            <view class="menu-icon" @click="showMenu">
              <u-icon name="more-dot-fill" size="24" color="#666"></u-icon>
            </view>
          </template>
        </u-tabs>
      </view>
    </view>

    <!-- 添加swiper组件 -->
    <swiper
      :current="currentIndex"
      @change="handleSwiperChange"
      :style="{ height: 'calc(100vh - ' + (getStatusBarHeight + 144) + 'px)' }"
    >
      <swiper-item v-for="(item, index) in operationList" :key="index">
        <scroll-view
          class="content-modules"
          scroll-y="true"
          :scroll-top="scrollTop"
          :scroll-with-animation="true"
        >
          <view class="grid-container">
            <!-- 刷题模块组 -->
            <view class="module-group">
              <text class="group-title">刷题模式</text>
              <view class="group-content">
                <view
                  class="module-card card-2x1"
                  @click="navigateTo('/pages/stage-practice/index')"
                >
                  <view class="step-badge">1</view>
                  <image
                    src="/static/icons/stage_practice.png"
                    class="module-icon"
                  ></image>
                  <view class="text-content">
                    <text class="module-title">阶段练习</text>
                    <text class="module-desc">循序渐进，攻克考点</text>
                  </view>
                </view>
                <view
                  class="module-card card-1x1"
                  @click="navigateTo('/pages/past-papers/index')"
                >
                  <view class="step-badge">2</view>
                  <image
                    src="/static/icons/papers.png"
                    class="module-icon"
                    style="width: 80px; height: 32px; object-fit: contain"
                  ></image>
                  <text class="module-title">历年真题</text>
                </view>
                <view
                  class="module-card card-1x1"
                  @click="navigateTo('/pages/year-analysis/index')"
                >
                  <view class="step-badge">3</view>
                  <image
                    src="/static/icons/year_analysis.png"
                    class="module-icon"
                  ></image>
                  <text class="module-title">历年真题分析</text>
                  <view class="vip-badge">
                    <text>VIP</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- AI辅助模块组 -->
            <view class="module-group">
              <text class="group-title">AI辅助</text>
              <view class="group-content">
                <view
                  class="module-card card-2x1"
                  @click="navigateTo('/pages/ai-tutor/index')"
                >
                  <image src="/static/icons/tutor.png" class="module-icon"></image>
                  <view class="text-content">
                    <text class="module-title">AI导师</text>
                    <text class="module-desc">贴身辅导，随时提问</text>
                  </view>
                </view>
                <view
                  class="module-card card-1x1"
                  @click="navigateTo(`/pages/mock-exam/index`)"
                >
                  <image src="/static/icons/exam.png" class="module-icon"></image>
                  <text class="module-title">AI模拟考试</text>
                </view>
                <view
                  class="module-card card-1x1"
                  @click="navigateTo('/pages/ai-predict/index')"
                >
                  <image src="/static/icons/predict.png" class="module-icon"></image>
                  <text class="module-title">AI押题</text>
                </view>
              </view>
            </view>

            <!-- 学习资源模块组 -->
            <view class="module-group">
              <text class="group-title">学习资源</text>
              <view class="group-content">
                <view
                  class="module-card card-1x1"
                  @click="navigateTo('/pages/premium-video/index')"
                >
                  <image
                    src="/static/icons/premium_video.png"
                    class="module-icon"
                  ></image>
                  <text class="module-title">精品视频</text>
                </view>
                <view
                  class="module-card card-1x1"
                  @click="navigateTo('/pages/my-questions/index')"
                >
                  <image src="/static/icons/my_questions.png" class="module-icon"></image>
                  <text class="module-title">我的题库</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>

    <!-- 引导提示 -->
    <u-popup :show="!examName && !isLoading" mode="top" :mask="false" :closeable="false">
      <view class="guide-tip" @click="selectSubject">
        <u-icon name="arrow-up" color="#F39B78" size="20"></u-icon>
        <text>请选择考试类型</text>
      </view>
    </u-popup>
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import * as SubjectApi from "@/api/subjectUser";
import { saveLog } from "@/api/log";

let _now = new Date();
let now_time = {};
now_time.year = _now.getFullYear();
now_time.month = _now.getMonth() + 1;
now_time.day = _now.getDay();

export default {
  components: {
    Navbar,
  },
  onShow() {
    this.loadSubjectData();
    setTimeout(() => {
      const systemInfo = uni.getSystemInfoSync();
      this.getStatusBarHeight = systemInfo.statusBarHeight || 0;
    }, 50);

    this.recordPageView();
  },
  methods: {
    loadSubjectData() {
      this.isLoading = true;
      SubjectApi.getSubject()
        .then((res) => {
          this.operationList = res.data.subjects;
          this.examName = res.data.examName;
          this.examCode = res.data.examCode;

          // 从本地存储获取上次选中的科目
          const lastSelected = uni.getStorageSync("lastSelectedSubject");

          if (this.operationList && this.operationList.length > 0) {
            if (lastSelected && lastSelected.subjectCode) {
              // 查找上次选中的科目在当前列表中的索引
              const foundIndex = this.operationList.findIndex(
                (item) => item.subjectCode === lastSelected.subjectCode
              );

              if (foundIndex !== -1) {
                // 如果找到匹配的科目，选中它
                this.currentIndex = foundIndex;
                this.currentSubjectCode = lastSelected.subjectCode;
              } else {
                // 如果没有找到匹配的科目，选中第一个
                this.currentIndex = 0;
                this.currentSubjectCode = this.operationList[0].subjectCode;
              }
            } else {
              // 如果没有上次选中的记录，选中第一个
              this.currentIndex = 0;
              this.currentSubjectCode = this.operationList[0].subjectCode;
            }
          }
          this.isLoading = false;
        })
        .catch(() => {
          this.isLoading = false;
        });
    },
    selectSubject() {
      uni.navigateTo({
        url: "/pages/exam/exam",
      });
    },
    handleDailyQuestClick() {
      uni.showToast({
        title: "功能开发中...",
        icon: "none",
        duration: 2000,
      });
    },
    handleSelect(index) {
      this.currentIndex = index.index;
      this.currentSubjectCode = this.operationList[index.index].subjectCode;
      // 保存选中的科目代码到本地存储
      uni.setStorageSync("lastSelectedSubject", {
        subjectCode: this.currentSubjectCode,
        index: this.currentIndex,
      });
    },
    showMenu() {
      uni.showActionSheet({
        itemList: this.operationList.map((item) => item.subjectName),
        success: (res) => {
          this.handleSelect({
            index: res.tapIndex,
            subjectCode: this.operationList[res.tapIndex].subjectCode,
          });
        },
      });
    },
    navigateTo(url) {
      if (url === "/pages/ai-predict/index") {
        // 显示开发中提示
        uni.showToast({
          title: "功能开发中...",
          icon: "none",
          duration: 2000,
        });
        return;
      }

      // 其他页面跳转逻辑保持不变
      if (url === "/pages/mock-exam/index" || url === "/pages/past-papers/index") {
        url = `${url}?subjectCode=${this.currentSubjectCode}&from=index`;
      }
      if (url === "/pages/year-analysis/index") {
        url = `${url}?subjectCode=${this.currentSubjectCode}`;
      }
      if (url === "/pages/stage-practice/index") {
        url = `${url}?subjectCode=${this.currentSubjectCode}`;
      }
      if (url === "/pages/my-questions/index") {
        url = `${url}?subjectCode=${this.currentSubjectCode}`;
      }
      uni.navigateTo({ url });
    },
    // 添加 swiper 切换事件处理
    handleSwiperChange(e) {
      const index = e.detail.current;
      this.handleSelect({
        index: index,
        subjectCode: this.operationList[index].subjectCode,
      });
    },
    recordPageView() {
      // 直接调用，不使用 async/await
      saveLog("访问首页").catch((error) => {
        console.error("记录日志失败:", error);
      });
    },
    onPageScroll(e) {
      this.pageScrollTop = e.scrollTop;
      console.log("页面滚动位置：", e.scrollTop);
    },
    onTabItemTap(e) {
      console.log("点击tabBar, index:", e.index);
      if (e.index === 0) {
        const currentTime = new Date().getTime();
        console.log("当前点击时间：", currentTime);
        console.log("上次点击时间：", this.lastTabClickTime);
        console.log("时间间隔：", currentTime - this.lastTabClickTime);

        if (currentTime - this.lastTabClickTime <= 300) {
          console.log("触发双击返回顶部");
          // 通过改变scrollTop值触发滚动
          this.scrollTop = this.scrollTop === 0 ? 0.01 : 0;
          console.log("返回顶部成功");
        }
        this.lastTabClickTime = currentTime;
      }
    },
  },
  data() {
    return {
      isLoading: false,
      operationList: [],
      currentIndex: 0,
      currentSubjectCode: "",
      examName: "",
      examCode: "",
      getStatusBarHeight: 0,
      lastTabClickTime: 0,
      pageScrollTop: 0,
      scrollTop: 0,
    };
  },
  mounted() {
    // 设置 swiper 高度
    const systemInfo = uni.getSystemInfoSync();
    this.getStatusBarHeight = systemInfo.statusBarHeight || 0;
  },
  onReady() {
    // 获取content-modules的引用
    const query = uni.createSelectorQuery().in(this);
    query
      .select(".content-modules")
      .boundingClientRect((data) => {
        console.log("content-modules ref:", data);
      })
      .exec();
  },
};
</script>
<style lang="scss" scoped>
// 修改全局滚动控制
:deep(page) {
  overflow: hidden;
  height: 100vh;
  position: fixed;
  width: 100%;
}

.index-content {
  height: 100vh;
  overflow: hidden;
  position: fixed;
  width: 100%;
  left: 0;
  top: 0;
}

// New gamified header styles
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: calc(var(--status-bar-height) + 10px) 15px 25px;
  background: linear-gradient(125deg, #f37335, #fdc830);
  border-bottom: 3px solid #d3642d;
  position: relative;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  transition: opacity 0.2s ease;

  &:active {
    opacity: 0.8;
  }
}

.player-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid #fff;
  background-color: rgba(255, 255, 255, 0.2);
}

.player-stats {
  display: flex;
  flex-direction: column;
}

.player-level-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.player-level {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.select-icon {
  margin-top: 2px;
}

.xp-bar {
  width: 120px;
  height: 10px;
  background-color: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  margin-top: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.xp-progress {
  height: 100%;
  background: linear-gradient(to right, #9ef01a, #70e000);
  border-radius: 10px;
  box-shadow: inset 0 -2px 2px rgba(0, 0, 0, 0.15);
}

.daily-quest {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #dc2f02, #9d0208);
  padding: 8px 12px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 2px solid #f37335;
  gap: 6px;
  transition: all 0.2s ease-in-out;

  &:active {
    transform: scale(0.95);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
}

.quest-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quest-icon {
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 0 2px #fff);
}

.quest-text {
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  line-height: 1.25;
  width: 30px;
  text-align: center;
}

// 优化内容容器
.content-container {
  padding: 0 15px;
}

// 优化选项卡容器
.tabs-container {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.98);
  margin-top: -15px;
  border-radius: 18px;
  padding: 8px 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  overflow-x: auto;
  white-space: nowrap;

  // 优化滚动条样式
  &::-webkit-scrollbar {
    height: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(243, 155, 120, 0.6);
    border-radius: 1.5px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(241, 241, 241, 0.5);
    border-radius: 1.5px;
  }
}

// 优化菜单图标
.menu-icon {
  padding: 0 10px;
  display: flex;
  align-items: center;
  height: 100%;
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
}

// 优化内容模块
.content-modules {
  margin-top: 15px;
  padding: 0 15px;
  height: calc(100% - 15px);
  overflow-y: auto;
  padding-bottom: 0;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  /* 添加平滑滚动 */
}

// 添加模块分组样式
.module-group {
  margin-bottom: 30px;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
  padding-left: 5px;
  position: relative;
  display: block;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 16px;
    background: linear-gradient(to bottom, #f39b78, #fbcba2);
    border-radius: 3px;
  }
}

.group-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 110px;
  gap: 15px;
}

// 修改原有的grid-container样式
.grid-container {
  padding-bottom: 15px;
}

// 优化模块卡片
.module-card {
  background: #ffffff;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  padding: 15px;

  // 添加悬停效果
  &:active {
    transform: translateY(2px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);
    background: #fafafa;
  }

  // 修改背景装饰
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at top right,
      rgba(243, 155, 120, 0.03) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
}

.card-1x1 {
  flex-direction: column;
}

.card-1x1 .module-icon {
  margin-bottom: 12px;
  margin-right: 0;
}

.card-1x1 .module-title {
  text-align: center;
}

.card-2x1 {
  grid-column: span 2;
  flex-direction: row;
  justify-content: flex-start;
  padding: 0 25px;
}

.card-2x1 .module-icon {
  margin-right: 20px;
  margin-bottom: 0;
  width: 48px;
  height: 48px;
}

.card-2x1 .text-content {
  align-items: flex-start;
}

.card-2x1 .module-title {
  font-size: 16px;
  font-weight: 700;
  text-align: left;
}

.text-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.module-desc {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
}

.module-icon {
  width: 42px;
  height: 42px;
  opacity: 0.9;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.module-title {
  font-size: 15px;
  color: #2c3e50;
  font-weight: 600;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
}

// 优化引导提示
.guide-tip {
  background: #ffffff;
  border-radius: 12px;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  position: fixed;
  top: calc(var(--status-bar-height) + 70px);
  left: 20px;
  box-shadow: 0 4px 15px rgba(243, 155, 120, 0.15);
  border: 1.5px solid #f39b78;
  z-index: 999;
  cursor: pointer;
  transition: all 0.3s ease;
}

// 添加刷题指导样式
.study-guide {
  display: none;
}

.guide-title {
  display: none;
}

.guide-text {
  display: none;
}

// 修改 swiper 相关样式
:deep(.uni-swiper-wrapper) {
  height: 100% !important;
}

:deep(.uni-swiper-item) {
  height: 100% !important;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  position: relative;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}

.vip-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
  padding: 3px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
  transform: rotate(0deg);
  transition: all 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.4),
      rgba(255, 255, 255, 0.1)
    );
    border-radius: 12px;
    z-index: -1;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shine 2s infinite;
  }

  text {
    color: #ffffff;
    font-size: 12px;
    font-weight: bold;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    letter-spacing: 0.5px;
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

// 修改 module-card 的 hover 状态，让 VIP 标识有动画效果
.module-card {
  &:active {
    .vip-badge {
      transform: rotate(-5deg) scale(1.05);
    }
  }
}

.step-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(135deg, #f39b78 0%, #fbcba2 100%);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(243, 155, 120, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
  z-index: 2;
}
</style>
