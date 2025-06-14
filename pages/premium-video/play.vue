<template>
  <view class="video-play">
    <u-navbar
      :title="videoInfo.title"
      :autoBack="true"
      bgColor="#f48c42"
      titleStyle="color: #ffffff; font-weight: 500;"
    ></u-navbar>
    
    <view class="content">
      <!-- 视频播放器 -->
      <view class="video-player">
        <video
          :src="videoInfo.videoUrl"
          :poster="videoInfo.coverUrl"
          controls
          class="player"
        ></video>
      </view>
      
      <!-- 视频信息 -->
      <view class="video-detail">
        <view class="title">{{videoInfo.title}}</view>
        <view class="stats">
          <text class="views">{{videoInfo.views}}次观看</text>
          <text class="date">{{videoInfo.date}}</text>
        </view>
        <view class="description">{{videoInfo.description}}</view>
      </view>
      
      <!-- 推荐视频列表 -->
      <view class="recommend-list">
        <view class="section-title">相关推荐</view>
        <view 
          class="recommend-item" 
          v-for="(item, index) in recommendList" 
          :key="index"
          @click="playVideo(item)"
        >
          <image :src="item.coverUrl" mode="aspectFill" class="thumb"></image>
          <view class="info">
            <text class="title">{{item.title}}</text>
            <view class="meta">
              <text class="views">{{item.views}}次观看</text>
              <text class="duration">{{item.duration}}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      videoInfo: {
        id: 0,
        title: '',
        videoUrl: '',
        coverUrl: '',
        views: '',
        date: '',
        description: ''
      },
      recommendList: []
    }
  },
  onLoad(options) {
    // 获取视频ID
    const videoId = options.id
    // TODO: 根据ID获取视频详情
    this.getVideoDetail(videoId)
    // TODO: 获取推荐视频列表
    this.getRecommendList()
  },
  methods: {
    getVideoDetail(id) {
      // 模拟数据，实际项目中应该从API获取
      this.videoInfo = {
        id: id,
        title: '2024考研政治核心考点精讲',
        videoUrl: 'https://example.com/video1.mp4',
        coverUrl: '/static/video/cover1.jpg',
        views: '2.3万',
        date: '2023-12-20',
        description: '本视频详细讲解了2024年考研政治的核心考点，包括马克思主义基本原理、毛泽东思想和中国特色社会主义理论体系等重要内容。'
      }
    },
    getRecommendList() {
      // 模拟数据，实际项目中应该从API获取
      this.recommendList = [
        {
          id: 2,
          title: '高等数学微积分重难点解析',
          coverUrl: '/static/video/cover2.jpg',
          duration: '38:15',
          views: '1.8万'
        }
      ]
    },
    playVideo(item) {
      // 切换到新视频
      uni.redirectTo({
        url: `/pages/premium-video/play?id=${item.id}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.video-play {
  min-height: 100vh;
  background-color: #f5f6fa;
  
  .content {
    padding-bottom: 20px;
  }
  
  .video-player {
    width: 100%;
    background: #000;
    
    .player {
      width: 100%;
      height: 225px;
    }
  }
  
  .video-detail {
    padding: 15px;
    background: #fff;
    
    .title {
      font-size: 18px;
      font-weight: 500;
      color: #333;
      line-height: 1.4;
    }
    
    .stats {
      margin-top: 8px;
      font-size: 13px;
      color: #999;
      display: flex;
      gap: 15px;
    }
    
    .description {
      margin-top: 12px;
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }
  }
  
  .recommend-list {
    margin-top: 10px;
    padding: 15px;
    background: #fff;
    
    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 15px;
    }
    
    .recommend-item {
      display: flex;
      margin-bottom: 15px;
      
      .thumb {
        width: 160px;
        height: 90px;
        border-radius: 8px;
      }
      
      .info {
        flex: 1;
        margin-left: 12px;
        
        .title {
          font-size: 14px;
          color: #333;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
        
        .meta {
          margin-top: 8px;
          font-size: 12px;
          color: #999;
          display: flex;
          gap: 10px;
        }
      }
    }
  }
}
</style> 