<template>
  <view class="index-content">

    <view>
      <u-row
        customStyle="margin: 0; background: linear-gradient(to bottom, #2BB5A0, #4ECDB6); border-radius: 0 0 30px 30px; padding: 20px; padding-top: calc(var(--status-bar-height) + 24px); box-shadow: 0 2px 10px rgba(0,0,0,0.1);"
      >
        <u-col span="6">
          <span
            @click="selectSubject"
            class="subject-selector"
            style="cursor: pointer"
          >
            <text class="subject-text">软件工程</text>
            <image
              src="/static/svg/exchange.svg"
              class="selector-icon"
            ></image>
          </span>
        </u-col>
        <u-col span="6">
          <span style="text-align: right"> </span>
        </u-col>
      </u-row>
    </view>
    <DraggableTags 
      :tags="tagsList"
      icon-type="add"
      :random-color="false"
      @change="onTagsChange"
        @remove="handleTagRemove"
      style="margin-top: 20px; display: block;" 
    />
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import DraggableTags from "@/components/DraggableTags/DraggableTags";

let _now = new Date();
let now_time = {};
now_time.year = _now.getFullYear();
now_time.month = _now.getMonth() + 1;
now_time.day = _now.getDay();

export default {
  components: {
    Navbar,
    DraggableTags,
  },
  methods: {
    handleTagRemove(tag) {
      console.log(tag);
    },
    onTagsChange(newTags) {
      this.tagsList = [...newTags]
      console.log(this.tagsList);
      
    },
    selectSubject() {
      uni.navigateTo({
        url: "/pages/exam/exam",
      });
    },
  },
  data() {
    return {
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
          desc: "信用卡转出",
        },
        {
          date: now_time.month + "-13",
          time: "17:21",
          type: "income",
          money: "10.00",
          desc: "银行卡收入",
        },
      ],
      tagsList: [
        { text: '数据结构', type: 'primary' },
        { text: '算法分析', type: 'warning' },
        { text: '软件测试', type: 'success' },
        { text: '需求分析', type: 'info' },
        { text: '系统设计', type: 'primary' },
        { text: '项目管理', type: 'warning' },
        { text: '软件架构', type: 'success' },
        { text: '代码审查', type: 'info' },
        { text: '敏捷开发', type: 'primary' },
        { text: '版本控制', type: 'warning' },
        { text: '持续集成', type: 'success' },
        { text: '我的内容非常多了', type: 'info' },
        { text: '我的内容非常多了我的更多了', type: 'info' },
        { text: '你看我的呢', type: 'info' }
      ],
    };
  },
};
</script>

<style lang="scss">
.subject-selector {
  text-align: left;
  position: absolute;
  /* #ifdef APP-PLUS */
  top: calc(var(--status-bar-height) + 6px);
  /* #endif */
  /* #ifndef APP-PLUS */
  top: calc(var(--status-bar-height) + 12px);
  /* #endif */
  padding-left: 15px;
  left: 0;
  color: #ffffff;
  display: flex;
  align-items: center;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
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
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
}
</style>
