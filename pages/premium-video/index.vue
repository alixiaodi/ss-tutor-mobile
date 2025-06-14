<template>
  <view class="premium-video">
    <u-navbar
      title="精品视频"
      :autoBack="true"
      bgColor="#f48c42"
      titleStyle="color: #ffffff; font-weight: 500;"
      :fixed="true"
      :placeholder="true"
    ></u-navbar>

    <view class="content">
      <!-- 视频列表 -->
      <scroll-view
        scroll-y
        class="video-list"
        :style="{ height: `calc(100vh - ${navHeight}px - 30px)` }"
        @scrolltolower="loadMore"
      >
        <view
          class="video-item"
          v-for="(item, index) in videoList"
          :key="index"
          @click="playVideo(item)"
        >
          <view class="video-cover">
            <image :src="item.coverUrl" mode="aspectFill"></image>
            <view class="duration">{{ item.duration }}</view>
          </view>
          <view class="video-info">
            <text class="title">{{ item.title }}</text>
            <view class="meta">
              <text class="views">{{ item.views }}次观看</text>
              <text class="date">{{ item.date }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      navHeight: 44 + uni.getSystemInfoSync().statusBarHeight,
      videoList: [
        {
          id: 1,
          title: "2024考研政治核心考点精讲",
          coverUrl: "/static/video/cover1.jpg",
          duration: "45:30",
          views: "2.3万",
          date: "2023-12-20",
        },
        {
          id: 2,
          title: "高等数学微积分重难点解析",
          coverUrl: "/static/video/cover2.jpg",
          duration: "38:15",
          views: "1.8万",
          date: "2023-12-18",
        },
      ],
    };
  },
  methods: {
    loadMore() {
      // TODO: 实现加载更多功能
      console.log("加载更多数据");
    },
    playVideo(item) {
      // TODO: 实现视频播放功能
      uni.navigateTo({
        url: `/pages/premium-video/play?id=${item.id}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.premium-video {
  min-height: 100vh;
  background-color: #f5f6fa;

  .content {
    padding: 15px;
    padding-top: 20px;
  }

  .video-list {
    width: 100%;
  }

  .video-item {
    background: #fff;
    border-radius: 12px;
    margin-bottom: 15px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

    .video-cover {
      position: relative;
      height: 200px;

      image {
        width: 100%;
        height: 100%;
      }

      .duration {
        position: absolute;
        right: 10px;
        bottom: 10px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
      }
    }

    .video-info {
      padding: 12px;

      .title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        line-height: 1.4;
      }

      .meta {
        margin-top: 8px;
        font-size: 12px;
        color: #999;
        display: flex;
        justify-content: space-between;
      }
    }
  }
}
</style>
