<template>
  <view class="detail-container">
    <Navbar
      :title="'题目对比详情'"
      bgColor="#f48c42"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></Navbar>

    <!-- 修改固定题目显示区域的样式 -->
    <view class="sticky-original" :class="{ 'show-sticky': showSticky }">
      <view class="sticky-content" v-if="currentGroup">
        <view class="sticky-header">
          <view class="group-index">{{ currentGroup.index }}</view>
          <text class="group-title">原始题目</text>
          <view class="toggle-btn" @click="toggleStickyExpand">
            <u-icon
              :name="isStickyExpanded ? 'arrow-up' : 'arrow-down'"
              size="14"
              color="#666"
            ></u-icon>
          </view>
        </view>
        <view class="sticky-body" :class="{ expanded: isStickyExpanded }">
          <text class="topic-content">{{ currentGroup.original }}</text>
        </view>
      </view>
    </view>

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
          <!-- 原有的题目显示区域保留 -->
          <view class="group-header">
            <view class="group-index">{{ group.index }}</view>
            <text class="group-title">原始题目</text>
          </view>
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

      <!-- 添加VIP提示 -->
      <view v-if="needVip" class="vip-tip" @click="handleVipClick">
        <view class="vip-btn">
          <u-icon name="vip" size="32" color="#FFB800" class="vip-icon"></u-icon>
          <text>开通VIP查看更多</text>
        </view>
      </view>
    </view>

    <!-- 添加返回顶部按钮 -->
    <view class="back-to-top" v-show="showBackToTop" @click="scrollToTop">
      <u-icon name="arrow-up" color="#fff" size="20"></u-icon>
    </view>

    <vip-popup :show="showVipPopup" @update:show="showVipPopup = $event"></vip-popup>
  </view>
</template>

<script>
import Navbar from "@/components/navbar/Navbar";
import * as AnalysisApi from "@/api/testPaper/analysis.js";
import VipPopup from "@/components/vip-popup/index.vue";

export default {
  components: {
    Navbar,
    VipPopup,
  },
  data() {
    return {
      groupedData: [], // 按原始题目分组的数据
      showSticky: false,
      currentGroup: null,
      currentGroupIndex: 0,
      isStickyExpanded: false,
      showBackToTop: false, // 是否显示返回顶部按钮
      needVip: false, // 添加是否需要VIP标识
      showVipPopup: false, // 添加VIP弹窗控制
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
    toggleStickyExpand() {
      this.isStickyExpanded = !this.isStickyExpanded;
    },
    handleScroll(e) {
      // 获取滚动距离
      const scrollTop = e.scrollTop;

      // 控制返回顶部按钮的显示/隐藏
      this.showBackToTop = scrollTop > 200;

      // 如果滚动距离大于100px，显示固定题目
      if (scrollTop > 100) {
        // 计算当前显示的题目组
        const query = uni.createSelectorQuery().in(this);
        query
          .selectAll(".topic-group")
          .boundingClientRect((rects) => {
            if (!rects || rects.length === 0) return;

            // 找到第一个在视图中的题目组
            const viewportHeight = uni.getSystemInfoSync().windowHeight;
            const navbarHeight = 44; // navbar的高度

            for (let i = 0; i < rects.length; i++) {
              const rect = rects[i];
              // 检查元素是否在可视区域内
              if (rect.top <= viewportHeight / 2 && rect.bottom >= navbarHeight) {
                this.currentGroup = this.groupedData[i];
                this.showSticky = true;
                break;
              } else if (i === rects.length - 1 && rect.top <= viewportHeight) {
                // 如果是最后一个元素且在视图内
                this.currentGroup = this.groupedData[i];
                this.showSticky = true;
                break;
              }
            }
          })
          .exec();
      } else {
        this.showSticky = false;
      }
    },
    // 滚动到顶部
    scrollToTop() {
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 300,
      });
    },
    handleVipClick() {
      this.showVipPopup = true;
    },
  },
  async onLoad(options) {
    if (options.id) {
      try {
        const res = await AnalysisApi.getPaperAnalysisDetail(options.id);
        if (res.msg === 204) {
          this.needVip = true;
          // 保留一条数据
          if (res.data && res.data.length > 0) {
            const firstGroup = res.data[0];
            firstGroup.index = 1;
            if (firstGroup.data) {
              firstGroup.data.forEach((item) => {
                this.$set(item, "isExpanded", false);
              });
            }
            this.groupedData = [firstGroup];
          }
          return;
        }
        if (res.data) {
          // 为数据添加序号
          res.data.forEach((group, index) => {
            // 添加题目序号（从1开始）
            group.index = index + 1;
          });
          res.data.forEach((group) => {
            group.data.forEach((item) => {
              this.$set(item, "isExpanded", false);
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
  mounted() {
    // 添加页面滚动监听
    // 不需要在这里添加监听，使用onPageScroll生命周期
  },
  beforeDestroy() {
    // 清理滚动监听
    // 不需要手动清理
  },
  onPageScroll(e) {
    this.handleScroll(e);
  },
};
</script>

<style lang="scss" scoped>
.detail-container {
  // 移除padding-top
}

.sticky-original {
  position: fixed;
  top: 44px; // navbar的高度
  left: 0;
  right: 0;
  z-index: 999;
  transform: translateY(-100%);
  transition: all 0.3s ease;
  opacity: 0;
  pointer-events: none;

  &.show-sticky {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .sticky-content {
    margin: 8px 15px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .sticky-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;

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
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .toggle-btn {
      padding: 4px;
      margin-left: 8px;
    }
  }

  .sticky-body {
    padding: 12px 16px;
    max-height: 44px;
    overflow: hidden;
    transition: max-height 0.3s ease;

    &.expanded {
      max-height: 200px;
      overflow-y: auto;
    }

    .topic-content {
      font-size: 14px;
      line-height: 1.6;
      color: #333;
    }
  }
}

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

/* 返回顶部按钮样式 */
.back-to-top {
  position: fixed;
  right: 20px;
  bottom: 120px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4ecdb6 0%, #44b6a1 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(78, 205, 182, 0.3);
  z-index: 99;
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
    opacity: 0.9;
  }
}

/* VIP提示样式 */
.vip-tip {
  margin-top: 30rpx;
  padding: 0 30rpx;

  .vip-btn {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(90deg, #4ecdb6 0%, #44b6a1 100%);
    border-radius: 44rpx;
    box-shadow: 0 8rpx 16rpx rgba(78, 205, 182, 0.2);

    .vip-icon {
      margin-right: 12rpx;
    }

    text {
      color: #ffffff;
      font-size: 32rpx;
      font-weight: 600;
      letter-spacing: 1px;
    }
  }
}
</style>
