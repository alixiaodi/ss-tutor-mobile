<template>
  <view class="draggable-tags">
    <view class="tags-container">
      <view
        v-for="(tag, index) in innerTags"
        :key="`tag-${index}`"
        class="tag-item"
        :class="[tag.type, { 'dragging': currentDragIndex === index, 'others-dragging': currentDragIndex !== -1 && currentDragIndex !== index }]"
        :style="getTagStyle(index)"
        @touchstart="handleTouchStart($event, index)"
        @touchmove="handleTouchMove($event, index)"
        @touchend="handleTouchEnd(index)"
      >
        {{ tag.text }}
        <text v-if="closeable" class="close-icon" @click.stop="removeTag(index)">
          {{ iconType === 'add' ? '+' : '×' }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DraggableTags',
  props: {
    tags: {
      type: Array,
      default: () => []
    },
    closeable: {
      type: Boolean,
      default: true
    },
    iconType: {
      type: String,
      default: 'close',
      validator: value => ['close', 'add'].includes(value)
    }
  },
  data() {
    return {
      innerTags: [],
      currentDragIndex: -1,
      startY: 0,
      startX: 0,
      dragX: 0,
      dragY: 0
    }
  },
  watch: {
    tags: {
      handler(newVal) {
        this.innerTags = [...newVal]
      },
      immediate: true
    }
  },
  methods: {
    handleTouchStart(event, index) {
      this.currentDragIndex = index
      this.startX = event.touches[0].clientX
      this.startY = event.touches[0].clientY
      this.dragX = 0
      this.dragY = 0
    },
    handleTouchMove(event, index) {
      if (this.currentDragIndex === -1) return
      
      const currentX = event.touches[0].clientX
      const currentY = event.touches[0].clientY
      
      // 更新拖动位置
      this.dragX = currentX - this.startX
      this.dragY = currentY - this.startY
      
      const deltaX = currentX - this.startX
      const deltaY = currentY - this.startY
      
      // 计算移动距离，判断是否需要交换位置
      if (Math.abs(deltaY) > 30 || Math.abs(deltaX) > 30) {
        this.findClosestTagIndex(currentX, currentY).then(targetIndex => {
          if (targetIndex !== -1 && targetIndex !== this.currentDragIndex) {
            this.swapTags(this.currentDragIndex, targetIndex)
            this.currentDragIndex = targetIndex
            this.startX = currentX
            this.startY = currentY
          }
        })
      }
    },
    handleTouchEnd(index) {
      if (this.currentDragIndex !== -1) {
        this.currentDragIndex = -1
        this.dragX = 0
        this.dragY = 0
        this.$emit('change', [...this.innerTags])
      }
    },
    async findClosestTagIndex(x, y) {
      // 使用 uniapp 的 API 获取元素位置信息
      const query = uni.createSelectorQuery().in(this)
      const tagsPromise = new Promise(resolve => {
        query.selectAll('.tag-item').boundingClientRect(data => {
          resolve(data)
        }).exec()
      })
      
      const tags = await tagsPromise
      let closestIndex = -1
      let minDistance = Infinity
      
      tags.forEach((rect, index) => {
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const distance = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        )
        
        if (distance < minDistance) {
          minDistance = distance
          closestIndex = index
        }
      })
      
      return closestIndex
    },
    swapTags(fromIndex, toIndex) {
      const temp = this.innerTags[fromIndex]
      this.innerTags.splice(fromIndex, 1)
      this.innerTags.splice(toIndex, 0, temp)
    },
    removeTag(index) {
      this.innerTags.splice(index, 1)
      this.$emit('change', [...this.innerTags])
    },
    getTagStyle(index) {
      if (index === this.currentDragIndex) {
        return {
          transform: `translate(${this.dragX}px, ${this.dragY}px)`,
          zIndex: 100,
          opacity: 0.8,
          transition: 'none'  // 拖动时取消过渡效果
        }

      }
      return {
        transform: 'translate(0, 0)',
        zIndex: 1,
        transition: 'all 0.3s'  // 其他标签有平滑过渡效果
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.draggable-tags {
  width: 100%;
  min-height: 100rpx;
  padding: 20rpx;
  box-sizing: border-box;
  
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }
  
  .tag-item {
    background-color: #f0f0f0;
    border-radius: 6rpx;
    padding: 10rpx 20rpx;
    display: inline-flex;
    align-items: center;
    font-size: 28rpx;
    touch-action: none;
    transition: transform 0.2s;
    
    &.dragging {
      background: #e6e6e6;  // 拖动时的背景色
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);  // 添加阴影效果
    }
    
    &.others-dragging {
      transition: transform 0.3s ease;  // 其他标签的过渡效果
    }
    
    .close-icon {
      margin-left: 10rpx;
      color: rgba(0, 0, 0, 0.5);
      font-size: 32rpx;
      font-weight: bold;
      padding: 0 4rpx;
      
      &:hover {
        color: rgba(0, 0, 0, 0.8);
      }
    }
    
    &.primary {
      background-color: #409eff;
      color: white;
      
      .close-icon {
        color: rgba(255, 255, 255, 0.9);
        
        &:hover {
          color: #fff;
        }
      }
    }
    
    &.warning {
      background-color: #e6a23c;
      color: white;
      
      .close-icon {
        color: rgba(255, 255, 255, 0.9);
        
        &:hover {
          color: #fff;
        }
      }
    }
    
    &.success {
      background-color: #67c23a;
      color: white;
      
      .close-icon {
        color: rgba(255, 255, 255, 0.9);
        
        &:hover {
          color: #fff;
        }
      }
    }
    
    &.info {
      background-color: #909399;
      color: white;
      
      .close-icon {
        color: rgba(255, 255, 255, 0.9);
        
        &:hover {
          color: #fff;
        }
      }
    }
  }
}
</style>
