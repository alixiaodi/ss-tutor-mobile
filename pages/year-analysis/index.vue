<template>
  <view class="analysis-container">
    <Navbar
      title="历年真题分析"
      bgColor="#4ECDB6"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></Navbar>

    <view class="content">
      <!-- 这里可以添加图表和分析内容 -->
      <qiun-data-charts type="line" :opts="opts" :chartData="chartData" />

      <view class="analysis-section">
        <view class="section-title">考点分布分析</view>
        <view class="analysis-content">
          <!-- 这里添加考点分布的具体内容 -->
        </view>
      </view>

      <view class="analysis-section">
        <view class="section-title">难度趋势分析</view>
        <view class="analysis-content">
          <!-- 这里添加难度趋势的具体内容 -->
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
      opts: {
        color: ["#4ECDB6", "#f04864"],
        padding: [15, 15, 15, 15],
        legend: {},
        xAxis: {
          disableGrid: true,
        },
        yAxis: {
          gridType: "dash",
          dashLength: 2,
        },
        extra: {
          line: {
            type: "straight",
            width: 2,
          },
        },
      },
      chartData: {
        categories: ["2019", "2020", "2021", "2022", "2023"],
        series: [
          {
            name: "平均分",
            data: [65, 70, 68, 72, 75],
          },
        ],
      },
    };
  },
  methods: {
    // 这里添加需要的方法
  },
};
</script>

<style lang="scss" scoped>
.analysis-container {
  min-height: 100vh;
  background-color: #f5f6fa;
}

.content {
  padding: 15px;
}

.analysis-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 3px solid #4ecdb6;
}

.analysis-content {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}
</style>
