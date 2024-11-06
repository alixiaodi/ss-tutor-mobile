<template>
  <view class="draggable-tags">
    <text class="drag-hint">拖拽可排序</text>
    <view class="tags-container">
      <view
        v-for="(tag, index) in innerTags"
        :key="`tag-${index}`"
        class="tag-item"
        :class="[
          {
            dragging: currentDragIndex === index,
            'others-dragging': currentDragIndex !== -1 && currentDragIndex !== index,
          },
        ]"
        :style="getTagStyle(index)"
        @touchstart="handleTouchStart($event, index)"
        @touchmove="handleTouchMove($event, index)"
        @touchend="handleTouchEnd(index)"
        @click="showFullText(tag.dictLabel)"
      >
        <text class="tag-text">{{ tag.dictLabel }}</text>
        <text
          v-if="closeable"
          class="close-icon"
          @click.stop="removeTag(index)"
          :style="[
            iconType === 'add' ? '' : 'color: #ff6b6b',
            randomColor ? 'color: #ffffff' : '',
          ]"
        >
          {{ iconType === "add" ? "+" : "×" }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "DraggableTags",
  props: {
    tags: {
      type: Array,
      default: () => [],
    },
    closeable: {
      type: Boolean,
      default: true,
    },
    iconType: {
      type: String,
      default: "close",
      validator(value) {
        if (!["close", "add"].includes(value)) {
          console.warn(`iconType 必须是 'close' 或 'add', 收到的值是: ${value}`);
          return false;
        }
        return true;
      },
    },
    randomColor: {
      type: Boolean,
      default: false,
    },
    preserveColor: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      innerTags: [],
      currentDragIndex: -1,
      startY: 0,
      startX: 0,
      dragX: 0,
      dragY: 0,
      tagColorMap: new Map(),
      swapTimeout: null,
    };
  },
  watch: {
    tags: {
      handler(newVal) {
        newVal.forEach((tag) => {
          if (!this.tagColorMap.has(tag.dictCode)) {
            this.tagColorMap.set(tag.dictCode, this.generateRandomColor());
          }
        });

        this.innerTags = newVal.map((tag) => ({
          ...tag,
          randomColor: this.randomColor ? this.tagColorMap.get(tag.dictCode) : null,
        }));
      },
      immediate: true,
    },
  },
  emits: ["change", "remove"],
  methods: {
    handleTouchStart(event, index) {
      this.currentDragIndex = index;
      const touch = event.touches[0];
      this.startX = touch.pageX;
      this.startY = touch.pageY;
      this.dragX = 0;
      this.dragY = 0;
    },
    handleTouchMove(event, index) {
      if (this.currentDragIndex === -1) return;

      const touch = event.touches[0];

      // 计算移动距离，不设限制
      this.dragX = touch.pageX - this.startX;
      this.dragY = touch.pageY - this.startY;

      // 使用 uni.createSelectorQuery 获取实际位置
      const query = uni.createSelectorQuery().in(this);
      query
        .selectAll(".tag-item")
        .boundingClientRect((rects) => {
          if (!rects || !rects.length) return;

          // 找到最近的标签
          let closestIndex = -1;
          let minDistance = Infinity;

          rects.forEach((rect, idx) => {
            if (idx === this.currentDragIndex) return;

            const distance = Math.sqrt(
              Math.pow(touch.pageX - (rect.left + rect.width / 2), 2) +
                Math.pow(touch.pageY - (rect.top + rect.height / 2), 2)
            );

            // 增大判定范围
            if (distance < minDistance && distance < rect.width * 1.5) {
              minDistance = distance;
              closestIndex = idx;
            }
          });

          // 如果找到合适的位置则交换
          if (closestIndex !== -1 && closestIndex !== this.currentDragIndex) {
            this.swapTags(this.currentDragIndex, closestIndex);
            this.currentDragIndex = closestIndex;

            // 更新起始位置
            this.startX = touch.pageX;
            this.startY = touch.pageY;
            this.dragX = 0;
            this.dragY = 0;
          }
        })
        .exec();
    },
    handleTouchEnd(index) {
      if (this.currentDragIndex !== -1) {
        // 重置所有状态
        this.currentDragIndex = -1;
        this.dragX = 0;
        this.dragY = 0;
        this.$emit("change", [...this.innerTags]);
      }
    },
    swapTags(fromIndex, toIndex) {
      const newTags = [...this.innerTags];
      const temp = newTags[fromIndex];
      newTags[fromIndex] = newTags[toIndex];
      newTags[toIndex] = temp;

      this.innerTags = newTags;
      this.$emit("change", this.innerTags);
    },
    removeTag(index) {
      const removedTag = this.innerTags[index];
      this.innerTags.splice(index, 1);
      this.$emit("remove", { tag: removedTag, index });
      this.$emit("change", [...this.innerTags]);
    },
    generateRandomColor() {
      const colors = [
        "#409eff", // 蓝色
        "#67c23a", // 绿色
        "#f56c6c", // 红色
        "#ff9800", // 橙色
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    },
    getTagStyle(index) {
      const style = {
        transform:
          index === this.currentDragIndex
            ? `translate3d(${this.dragX}px, ${this.dragY}px, 0)`
            : "translate3d(0, 0, 0)",
        zIndex: index === this.currentDragIndex ? 100 : 1,
        transition: index === this.currentDragIndex ? "none" : "transform 0.2s ease",
      };

      if (this.randomColor && this.innerTags[index]) {
        style.backgroundColor = this.innerTags[index].randomColor;
        style.color = "#333333";
        style.border = "none";
      }

      return style;
    },
    showFullText(text) {
      uni.showToast({
        title: text,
        icon: "none",
        duration: 2000,
        position: "bottom",
      });
    },
    getTagColor(tag) {
      const colors = [
        "#E3F2FD",
        "#E8F5E9",
        "#FFF3E0",
        "#F3E5F5",
        "#E1F5FE",
        "#E0F2F1",
        "#FBE9E7",
        "#F1F8E9",
      ];

      if (tag.dictCode) {
        const index = Math.abs(this.hashCode(tag.dictCode)) % colors.length;
        return colors[index];
      }

      return colors[Math.floor(Math.random() * colors.length)];
    },
    hashCode(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return hash;
    },
  },
  beforeDestroy() {
    if (this.swapTimeout) {
      clearTimeout(this.swapTimeout);
    }
  },
};
</script>

<style lang="scss" scoped>
.draggable-tags {
  width: 100%;
  min-height: 100rpx;
  padding: 20rpx;
  box-sizing: border-box;

  .drag-hint {
    display: block;
    color: #999;
    font-size: 24rpx;
    margin-bottom: 16rpx;
    padding-left: 10rpx;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    justify-content: flex-start;
    position: relative;
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
    position: relative;

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
