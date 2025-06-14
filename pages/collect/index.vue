<template>
  <view class="collect-container">
    <Navbar
      title="我的收藏"
      bgColor="#f48c42"
      :hideBtn="false"
      :h5Show="true"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></Navbar>

    <!-- 空状态 -->
    <u-empty
      v-if="collectList.length === 0"
      mode="data"
      icon="http://cdn.uviewui.com/uview/empty/data.png"
      text="暂无收藏内容"
    >
    </u-empty>

    <!-- 收藏列表 -->
    <view class="collect-list" v-else>
      <view
        class="paper-group"
        v-for="(paper, paperIndex) in collectList"
        :key="paperIndex"
      >
        <view class="paper-title" @click="togglePaper(paperIndex)">
          <view class="title-content">
            <text>{{ paper.name }}</text>
            <text class="question-count">({{ paper.infoCount }}个收藏)</text>
          </view>
          <view class="title-actions">
            <view class="delete-btn" @click.stop="deleteGroup(paperIndex)">
              <u-icon name="trash" size="28" color="#FF5252"></u-icon>
            </view>
            <view class="fold-icon" :class="{ 'is-fold': !paper.isExpanded }">
              <u-icon name="arrow-down" size="28"></u-icon>
            </view>
          </view>
        </view>
        <view class="questions-wrapper" v-show="paper.isExpanded">
          <view
            class="collect-item"
            v-for="(item, index) in paper.collects || []"
            :key="index"
          >
            <view class="item-header">
              <text class="item-time">{{ item.createTime }}</text>
            </view>
            <view class="item-content">{{ item.content }}</view>
            <view class="item-footer">
              <view class="item-actions">
                <u-button
                  type="error"
                  size="mini"
                  @click="cancelCollect(paperIndex, index)"
                  plain
                  >取消收藏</u-button
                >
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
import { getCollectGroupList, deleteCollectGroup } from "@/api/collectGroup";
import { listCollectInfo, deleteCollectInfo } from "@/api/collectInfo";

export default {
  components: {
    Navbar,
  },
  data() {
    return {
      collectList: [],
      loading: false,
    };
  },
  onShow() {
    this.getList();
  },
  methods: {
    getTags(tags) {
      if (!tags) return [];
      return tags.split(",").filter((tag) => tag);
    },
    // 获取收藏组列表
    async getList() {
      if (this.loading) return;
      this.loading = true;
      try {
        uni.showLoading({
          title: "加载中...",
        });
        const { data } = await getCollectGroupList();
        if (data) {
          this.collectList = data.map((item) => ({
            ...item,
            isExpanded: false, // 默认收起
            collects: [], // 初始化收藏列表为空数组
          }));
        }
      } catch (error) {
        console.error("获取收藏组列表失败：", error);
        uni.showToast({
          title: "获取收藏组列表失败",
          icon: "none",
        });
      } finally {
        uni.hideLoading();
        this.loading = false;
      }
    },
    // 获取收藏组详情
    async getGroupDetail(groupId, index) {
      try {
        const { data } = await listCollectInfo(groupId);
        if (data) {
          this.$set(this.collectList[index], "collects", data);
        }
      } catch (error) {
        console.error("获取收藏详情失败：", error);
        uni.showToast({
          title: "获取收藏详情失败",
          icon: "none",
        });
      }
    },
    // 切换展开/收起
    async togglePaper(index) {
      const paper = this.collectList[index];
      const willExpand = !paper.isExpanded;

      // 如果是展开且还没有加载过数据
      if (willExpand && (!paper.collects || paper.collects.length === 0)) {
        uni.showLoading({
          title: "加载中...",
        });
        await this.getGroupDetail(paper.id, index);
        uni.hideLoading();
      }

      this.$set(this.collectList[index], "isExpanded", willExpand);
    },
    viewDetail(item, paperId) {
      const pageUrl = {
        单选题: "/pages/past-papers/exam?type=1",
        多选题: "/pages/past-papers/exam?type=2",
        判断题: "/pages/past-papers/exam?type=3",
      };

      const url = `${pageUrl[item.type]}&id=${item.id}&paperId=${paperId}`;
      uni.navigateTo({
        url: url,
        fail: (err) => {
          console.error("跳转失败：", err);
          uni.showToast({
            title: "跳转失败，请稍后重试",
            icon: "none",
          });
        },
      });
    },
    async cancelCollect(paperIndex, questionIndex) {
      const item = this.collectList[paperIndex].collects[questionIndex];
      uni.showModal({
        title: "提示",
        content: "确定要取消收藏吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({
                title: "取消中...",
              });
              await deleteCollectInfo(item.id);

              // 更新本地数据
              this.collectList[paperIndex].collects.splice(questionIndex, 1);
              // 更新收藏数量
              this.collectList[paperIndex].infoCount = (
                parseInt(this.collectList[paperIndex].infoCount) - 1
              ).toString();

              uni.showToast({
                title: "已取消收藏",
                icon: "success",
              });
            } catch (error) {
              console.error("取消收藏失败：", error);
              uni.showToast({
                title: "取消收藏失败",
                icon: "none",
              });
            } finally {
              uni.hideLoading();
            }
          }
        },
      });
    },
    // 删除收藏组
    async deleteGroup(index) {
      const paper = this.collectList[index];
      uni.showModal({
        title: "提示",
        content: "确定要删除该收藏组吗？删除后组内所有收藏内容将一并删除",
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({
                title: "删除中...",
              });
              await deleteCollectGroup(paper.id);
              this.collectList.splice(index, 1);
              uni.showToast({
                title: "删除成功",
                icon: "success",
              });
            } catch (error) {
              console.error("删除收藏组失败：", error);
              uni.showToast({
                title: "删除失败",
                icon: "none",
              });
            } finally {
              uni.hideLoading();
            }
          }
        },
      });
    },
  },
};
</script>

<style lang="scss">
.collect-container {
  min-height: 100vh;
  background-color: #f5f6fa;
}

.collect-list {
  padding: 20rpx;
}

.paper-group {
  margin-bottom: 40rpx;

  .paper-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 36rpx;
    font-weight: bold;
    color: #303133;
    padding: 24rpx 30rpx;
    background-color: #ffffff;
    border-radius: 12rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    cursor: pointer;

    .title-content {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .question-count {
        font-size: 28rpx;
        color: #909399;
        font-weight: normal;
      }
    }

    .title-actions {
      display: flex;
      align-items: center;
      gap: 20rpx;

      .delete-btn {
        padding: 10rpx;
      }

      .fold-icon {
        transition: transform 0.3s ease;

        &.is-fold {
          transform: rotate(-180deg);
        }
      }
    }
  }

  .questions-wrapper {
    transition: all 0.3s ease-in-out;
  }
}

.collect-item {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .item-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 20rpx;

    .item-time {
      color: #909399;
      font-size: 26rpx;
    }
  }

  .item-content {
    color: #303133;
    font-size: 32rpx;
    line-height: 1.8;
    margin-bottom: 24rpx;
    white-space: pre-line;
    letter-spacing: 1px;
    padding: 0 10rpx;
  }

  .item-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: 10rpx;

    .item-actions {
      display: flex;
      gap: 16rpx;
    }
  }
}

:deep(.u-button) {
  margin: 0;

  &--mini {
    padding: 0 30rpx;
    font-size: 28rpx;
    height: 60rpx;
  }
}

:deep(.u-tag) {
  margin-right: 12rpx;

  &--mini {
    padding: 4rpx 12rpx;
  }
}
</style>
