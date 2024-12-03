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
      :style="{ height: swiperHeight + 'px' }"
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
  },
  data() {
    return {
      isLoading: true,
      isCanvas2d: true,
      delayload: false,
      historyData: {
        categories: ["1月", "2月", "2月", "4月", "5月"],
        series: [
          {
            name: "收入情况",
            data: [1601, 1840.5, 1900, 1760, 1500.85],
            type: "line",
            style: "curve",
            color: "#4ECDB6",
            unit: "",
          },
        ],
        yAxis: [
          {
            calibration: true,
            position: "left",
            title: "单位/元",
            titleFontSize: 12,
            unit: "",
            tofix: 0,
            min: 0,
            disableGrid: true,
          },
        ],
      },
      detail_list: [
        {
          date: now_time.month + "-01",
          time: "11:01",
          type: "extend",
          money: "10.00",
          desc: "银行卡转出",
        },
        {
          date: now_time.month + "-01",
          time: "13:45",
          type: "income",
          money: "18.00",
          desc: "银行卡收入",
        },
        {
          date: now_time.month + "-02",
          time: "06:21",
          type: "extend",
          money: "123.45",
          desc: "信用卡转出",
        },
        {
          date: now_time.month + "-03",
          time: "07:38",
          type: "income",
          money: "23.00",
          desc: "银行卡收入",
        },
        {
          date: now_time.month + "-08",
          time: "16:28",
          type: "extend",
          money: "23.56",
          desc: "信用卡转出",
        },
        {
          date: now_time.month + "-09",
          time: "15:25",
          type: "income",
          money: "850.12",
          desc: "银行卡收入",
        },
        {
          date: now_time.month + "-09",
          time: "18:52",
          type: "income",
          money: "1.88",
          desc: "银行卡收入",
        },
        {
          date: now_time.month + "-11",
          time: "21:12",
          type: "extend",
          money: "220.21",
          desc: "银行卡转出",
        },
        {
          date: now_time.month + "-12",
          time: "13:08",
          type: "income",
          money: "32.28",
          desc: "银行卡收入",
        },
        {
          date: now_time.month + "-12",
          time: "12:41",
          type: "extend",
          money: "122.12",
          desc: "信用卡转",
        },
        {
          date: now_time.month + "-13",
          time: "17:21",
          type: "income",
          money: "10.00",
          desc: "银行卡收入",
        },
      ],
      currentIndex: 0,
      operationList: [],
      examName: "",
      examCode: "",
      currentSubjectCode: "",
      swiperHeight: 300, // 添加 swiper 高度控制
    };
  },
  mounted() {
    // 设置 swiper 高度
    const systemInfo = uni.getSystemInfoSync();
    this.swiperHeight = systemInfo.windowHeight - 220; // 根据实际内容调整减去的高度
  },
};
</script>
<style lang="scss">
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
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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
  filter: brightness(0) invert(1);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}

.header {
  position: relative;
  z-index: 1;
  margin-bottom: 5px;
}

.content-container {
  padding: 0 10px;
}

.tabs-container {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.95);
  margin-top: -60px;
  border-radius: 15px;
  padding: 5px 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
  white-space: nowrap;
}

.tabs-container::-webkit-scrollbar {
  height: 4px;
}

.tabs-container::-webkit-scrollbar-thumb {
  background: #4ecdb6;
  border-radius: 2px;
}

.tabs-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.menu-icon {
  padding: 0 10px;
  display: flex;
  align-items: center;
  height: 100%;
  cursor: pointer;
}

.content-modules {
  margin-top: 20px; // 调整上边距
  padding: 0 15px;
  height: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.module-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  height: 120px;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.03);

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    background: #fafafa;
  }
}

.module-icon {
  width: 44px;
  height: 44px;
  margin-bottom: 12px;
  opacity: 0.9;
}

.module-title {
  font-size: 15px;
  color: #2c3e50;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.3px;
}

.guide-tip {
  background: #ffffff;
  border-radius: 8px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: fixed;
  top: calc(var(--status-bar-height) + 70px);
  left: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #4ecdb6;
  z-index: 999;
  cursor: pointer;

  text {
    color: #4ecdb6;
    font-size: 14px;
  }

  &:active {
    opacity: 0.8;
  }
}
</style>
