<template>
  <view class="detail-container">
    <Navbar
      :title="'题目对比详情'"
      bgColor="#4ECDB6"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></Navbar>

    <view class="content">
      <!-- 添加空状态显示 -->
      <view v-if="!groupedData.length" class="empty-state">
        <u-icon name="file-text" size="80" color="#c0c4cc"></u-icon>
        <text class="empty-text">暂无分析内容</text>
      </view>

      <view
        v-else
        v-for="(group, groupIndex) in groupedData"
        :key="groupIndex"
        class="topic-group"
      >
        <view class="group-wrapper">
          <!-- 组标题 -->
          <view class="group-header">
            <view class="group-index">{{ groupIndex + 1 }}</view>
            <text class="group-title">原始题目</text>
          </view>

          <!-- 原始题目 -->
          <view class="original-topic">
            <view class="topic-content">{{ group.original }}</view>
          </view>

          <!-- 分割线和对比数量提示 -->
          <view class="divider">
            <text class="divider-text">共{{ group.data.length }}个对比结果</text>
          </view>

          <!-- 对比结果列表 -->
          <view class="compare-list">
            <view class="compare-item" v-for="(item, index) in group.data" :key="item.id">
              <view class="compare-card" @click="toggleNode(item)">
                <!-- 卡片头部 -->
                <view class="card-header">
                  <view class="header-left">
                    <text class="compare-index">对比 {{ index + 1 }}</text>
                    <text class="similarity" :class="getSimilarityClass(item)">
                      相似度 {{ getSimilarity(item) }}%
                    </text>
                  </view>
                  <u-icon
                    :name="item.isExpanded ? 'arrow-up' : 'arrow-down'"
                    size="16"
                    color="#999"
                  ></u-icon>
                </view>

                <!-- 卡片内容 -->
                <view class="card-content" :class="{ 'is-expanded': item.isExpanded }">
                  <view class="info-row">
                    <text class="label">考点</text>
                    <text class="value highlight">{{ getExamCenter(item) }}</text>
                  </view>
                  <view class="info-row">
                    <text class="label">对比试卷</text>
                    <text class="value">{{ item.contrastTestPaperName }}</text>
                  </view>
                  <view class="info-row">
                    <text class="label">对比题目</text>
                    <text class="value">{{ item.contrastTopicName }}</text>
                  </view>
                  <view class="info-row">
                    <text class="label">题型</text>
                    <text class="value">{{ item.contrastTopicType }}</text>
                  </view>
                  <view class="reason-box">
                    <text class="reason-title">分析原因</text>
                    <text class="reason-content">{{ getReason(item) }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import * as AnalysisApi from "@/api/testPaper/analysis.js";

export default {
  components: {
    Navbar,
  },
  data() {
    return {
      groupedData: [], // 按原始题目分组的数据
    };
  },
  methods: {
    getSimilarity(item) {
      return item.result && item.result.similarity ? item.result.similarity : 0;
    },
    getExamCenter(item) {
      return item.result && item.result.examCenter ? item.result.examCenter : "-";
    },
    getReason(item) {
      return item.result && item.result.reason ? item.result.reason : "-";
    },
    getSimilarityClass(item) {
      const similarity = this.getSimilarity(item);
      if (similarity >= 80) return "high-similarity";
      if (similarity >= 50) return "medium-similarity";
      return "low-similarity";
    },
    toggleNode(item) {
      // 使用 Vue.set 确保响应性
      this.$set(item, "isExpanded", !item.isExpanded);
    },
  },
  async onLoad(options) {
    if (options.id) {
      try {
        const res = await AnalysisApi.getPaperAnalysisDetail(options.id);
        if (res.data) {
          // 为每个对比结果添加展开状态，默认为折叠状态
          res.data.forEach((group) => {
            group.data.forEach((item) => {
              this.$set(item, "isExpanded", false); // 修改为默认折叠
            });
          });
          this.groupedData = res.data;
        }
      } catch (error) {
        uni.showToast({
          title: "获取详情失败",
          icon: "none",
        });
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.content {
  padding: 15px;
  background: #fff;
}

.topic-group {
  margin-bottom: 20px;
}

.group-wrapper {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.group-header {
  padding: 16px;
  display: flex;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;

  .group-index {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    background: #4ecdb6;
    color: #fff;
    border-radius: 12px;
    font-size: 14px;
    margin-right: 12px;
  }

  .group-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
}

.original-topic {
  padding: 16px 20px;
  background: #fff;

  .topic-content {
    font-size: 15px;
    line-height: 1.6;
    color: #333;
  }
}

.divider {
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;

  &::before {
    content: "";
    position: absolute;
    left: 20px;
    right: 20px;
    top: 50%;
    height: 1px;
    background: #e4e7ed;
  }

  .divider-text {
    position: relative;
    padding: 0 12px;
    background: #fff;
    color: #909399;
    font-size: 13px;
  }
}

.compare-list {
  padding: 16px;
  background: #fff;
}

.compare-item {
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.compare-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid #e4e7ed;

  &:hover {
    transform: translateX(4px);
  }
}

.card-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-bottom: 1px solid #e4e7ed;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .compare-index {
    min-width: 48px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    background: #f4f4f5;
    color: #909399;
    border-radius: 12px;
    font-size: 13px;
    padding: 0 8px;
  }

  .similarity {
    font-size: 14px;
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 20px;

    &.high-similarity {
      background: #e8f7f4;
      color: #4ecdb6;
    }

    &.medium-similarity {
      background: #fff7e6;
      color: #ffa940;
    }

    &.low-similarity {
      background: #fff1f0;
      color: #ff4d4f;
    }
  }
}

.card-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;

  &.is-expanded {
    max-height: 800px;
  }
}

.info-row {
  padding: 12px 16px;
  display: flex;
  align-items: flex-start;
  border-bottom: 1px solid #e4e7ed;

  .label {
    width: 80px;
    color: #909399;
    font-size: 14px;
    flex-shrink: 0;
  }

  .value {
    flex: 1;
    font-size: 14px;
    line-height: 1.6;
    color: #606266;

    &.highlight {
      color: #4ecdb6;
      font-weight: 500;
    }
  }
}

.reason-box {
  padding: 16px;

  .reason-title {
    display: block;
    color: #666;
    font-size: 14px;
    margin-bottom: 8px;
  }

  .reason-content {
    font-size: 14px;
    line-height: 1.6;
    color: #333;
  }
}

// 添加空状态样式
.empty-state {
  height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12px;
  margin: 15px;

  .empty-text {
    margin-top: 20px;
    font-size: 28rpx;
    color: #999;
  }
}
</style>
