<template>
  <view class="draggable-tags">
    <view class="tags-container">
      <view v-for="(tag, index) in innerTags" :key="`tag-${index}`" class="tag-item"
        :class="[{ 'dragging': currentDragIndex === index, 'others-dragging': currentDragIndex !== -1 && currentDragIndex !== index }]"
        :style="getTagStyle(index)" @touchstart="handleTouchStart($event, index)"
        @touchmove="handleTouchMove($event, index)" @touchend="handleTouchEnd(index)" @click="showFullText(tag.text)">
        <text class="tag-text">{{ tag.text }}</text>
        <text v-if="closeable" class="close-icon" @click.stop="removeTag(index)" :style="[
          iconType === 'add' ? '' : 'color: #ff6b6b',
          randomColor ? 'color: #ffffff' : ''
        ]">
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
      validator(value) {
        if (!['close', 'add'].includes(value)) {
          console.warn(`iconType 必须是 'close' 或 'add', 收到的值是: ${value}`);
          return false;
        }
        return true;
      }
    },
    randomColor: {
      type: Boolean,
      default: false
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
        this.innerTags = newVal.map(tag => ({
          ...tag,
          randomColor: this.randomColor ? this.getRandomColor() : null
        }));
      },
      immediate: true
    }
  },
  emits: ['change', 'remove'],
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
      this.$emit('change', [...this.innerTags])
    },
    removeTag(index) {
      const removedTag = this.innerTags[index]
      this.innerTags.splice(index, 1)
      this.$emit('remove', { tag: removedTag, index })
      this.$emit('change', [...this.innerTags])
    },
    getRandomColor() {
      const colors = [
        '#409eff', // 蓝色
        '#67c23a', // 绿色
        '#e6a23c', // 橙色
        '#f56c6c'  // 红色
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    },
    getTagStyle(index) {
      const baseStyle = {
        transform: index === this.currentDragIndex 
          ? `translate(${this.dragX}px, ${this.dragY}px)`
          : 'translate(0, 0)',
        zIndex: index === this.currentDragIndex ? 100 : 1,
        transition: index === this.currentDragIndex ? 'none' : 'all 0.3s'
      };
      
      // 如果启用随机颜色，直接使用标签的随机颜色
      if (this.randomColor) {
        baseStyle.backgroundColor = this.innerTags[index].randomColor;
        baseStyle.color = '#ffffff';
        baseStyle.border = 'none'; // 移除默认边框
      }
      
      return baseStyle;
    },
    showFullText(text) {
      uni.showToast({
        title: text,
        icon: 'none',
        duration: 2000,
        position: 'bottom'
      })
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
    justify-content: flex-start;
  }

  .tag-item {
    width: calc((100% - 40rpx) / 3);
    box-sizing: border-box;
    background-color: #f0f0f0;
    border-radius: 6rpx;
    padding: 10rpx 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 28rpx;
    touch-action: none;
    transition: transform 0.2s;

    .tag-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 10rpx; // 为关闭按钮留出空间
    }

    &.dragging {
      background: #e6e6e6; // 拖动时的背景色
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); // 添加阴影效果
    }

    &.others-dragging {
      transition: transform 0.3s ease; // 其他标签的过渡效果
    }

    .close-icon {
      flex-shrink: 0; // 防止关闭按钮被压缩
      color: rgba(0, 0, 0, 0.5);
      font-size: 32rpx;
      font-weight: bold;
      padding: 0 4rpx;

      &:hover {
        color: rgba(0, 0, 0, 0.8);
      }
    }
  }
}
</style>
