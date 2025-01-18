<template>
  <view class="index-content">
    <view class="header">
      <u-row
        customStyle="margin: 0; background: linear-gradient(to bottom, #2BB5A0, #4ECDB6); border-radius: 0 0 30px 30px; padding: 20px; padding-top: calc(var(--status-bar-height) + 24px); padding-bottom: 90px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);"
      >
        <u-col span="6">
          <span @click="selectSubject" class="subject-selector" style="cursor: pointer">
            <text class="subject-text">{{ examName ? examName : "请选择" }}</text>
            <image src="/static/svg/exchange.svg" class="selector-icon"></image>
          </span>
        </u-col>
        <u-col span="6">
          <span style="text-align: right"> </span>
        </u-col>
      </u-row>
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
          activeStyle="color: #4ECDB6; font-weight: bold; transform: scale(1.05);"
          inactiveStyle="color: #666;"
          lineColor="#4ECDB6"
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
        <view class="content-modules">
          <view class="grid-container">
            <view class="module-card" @click="navigateTo('/pages/past-papers/index')">
              <image
                src="/static/icons/papers.png"
                class="module-icon"
                style="width: 80px; height: 32px; object-fit: contain"
              ></image>
              <text class="module-title">历年真题</text>
            </view>
            <view class="module-card" @click="navigateTo(`/pages/mock-exam/index`)">
              <image src="/static/icons/exam.png" class="module-icon"></image>
              <text class="module-title">AI模拟考试</text>
            </view>

            <view class="module-card" @click="navigateTo('/pages/ai-tutor/index')">
              <image src="/static/icons/tutor.png" class="module-icon"></image>
              <text class="module-title">AI导师</text>
            </view>
            <view class="module-card" @click="navigateTo('/pages/ai-predict/index')">
              <image src="/static/icons/predict.png" class="module-icon"></image>
              <text class="module-title">AI押题</text>
            </view>
            <view class="module-card" @click="navigateTo('/pages/year-analysis/index')">
              <image src="/static/icons/year_analysis.png" class="module-icon"></image>
              <text class="module-title">历年真题分析</text>
              <view class="vip-badge">
                <text>VIP</text>
              </view>
            </view>
            <view class="module-card" @click="navigateTo('/pages/stage-practice/index')">
              <image src="/static/icons/stage_practice.png" class="module-icon"></image>
              <text class="module-title">阶段练习</text>
            </view>
            <view class="module-card" @click="navigateTo('/pages/premium-video/index')">
              <image src="/static/icons/premium_video.png" class="module-icon"></image>
              <text class="module-title">精品视频</text>
            </view>
            <view class="module-card" @click="navigateTo('/pages/my-questions/index')">
              <image src="/static/icons/my_questions.png" class="module-icon"></image>
              <text class="module-title">我的题库</text>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 引导提示 -->
    <u-popup :show="!examName && !isLoading" mode="top" :mask="false" :closeable="false">
      <view class="guide-tip" @click="selectSubject">
        <u-icon name="arrow-up" color="#4ECDB6" size="20"></u-icon>
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
  },
  data() {
    return {
      isLoading: true,
      currentIndex: 0,
      operationList: [],
      examName: "",
      examCode: "",
      currentSubjectCode: "",
      swiperHeight: 300,
      getStatusBarHeight: 0,
    };
  },
  mounted() {
    // 设置 swiper 高度
    const systemInfo = uni.getSystemInfoSync();
    this.getStatusBarHeight = systemInfo.statusBarHeight || 0;
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

.subject-selector {
  text-align: left;
  position: absolute;
  /* #ifdef APP-PLUS */
  top: calc(var(--status-bar-height) + 12px);
  /* #endif */
  /* #ifndef APP-PLUS */
  top: calc(var(--status-bar-height) + 18px);
  /* #endif */
  padding-left: 15px;
  left: 0;
  color: #ffffff;
  display: flex;
  align-items: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);

  // 添加悬停效果
  &:active {
    opacity: 0.8;
  }
}

.subject-text {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.5px;
}

.selector-icon {
  width: 40rpx;
  height: 40rpx;
  margin-left: 12rpx;
  filter: brightness(0) invert(1) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  transition: transform 0.3s ease;

  // 添加旋转动画
  &:active {
    transform: rotate(180deg);
  }
}

.header {
  position: relative;
  z-index: 1;
  margin-bottom: 5px;
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
  margin-top: -60px;
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
    background: rgba(78, 205, 182, 0.6);
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
  -webkit-overflow-scrolling: touch; /* 添加平滑滚动 */
}

// 优化网格布局
.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding-bottom: 15px;
}

// 优化模块卡片
.module-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  height: 120px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;

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
      rgba(78, 205, 182, 0.03) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
}

.module-icon {
  width: 42px;
  height: 42px;
  margin-bottom: 12px;
  opacity: 0.9;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;

  &:active {
    transform: scale(1.05);
  }
}

.module-title {
  font-size: 15px;
  color: #2c3e50;
  font-weight: 600;
  text-align: center;
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
  box-shadow: 0 4px 15px rgba(78, 205, 182, 0.15);
  border: 1.5px solid #4ecdb6;
  z-index: 999;
  cursor: pointer;
  transition: all 0.3s ease;

  text {
    color: #4ecdb6;
    font-size: 14px;
    font-weight: 500;
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(78, 205, 182, 0.1);
  }
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
</style>
