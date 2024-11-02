<template>
  <view class="page-container">
    <scroll-view class="scroll-content" scroll-y>
      <view class="content-wrapper">
        <view
          class="tag-wrapper"
          style="
            background-color: #fff;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            margin-bottom: 16px;
            position: relative;
            border: 1px solid rgba(0, 0, 0, 0.05);
          "
        >
          <view
            class="section-title section-title--with-border"
            style="
              font-size: 16px;
              font-weight: 600;
              color: #333;
              margin-bottom: 16px;
              padding-left: 10px;
              border-left: 4px solid #4caf50;
              display: flex;
              align-items: center;
              position: relative;
              z-index: 2;
              background: #fff;
            "
            >我的科目</view
          >
          <view
            ref="selectedTags"
            class="tag-list"
            style="position: relative; z-index: 1"
          >
            <template v-if="selectedList && selectedList.length > 0">
              <template v-if="selectedList && selectedList.length > 0">
                <u-tag
                  v-for="(item, index) in selectedList"
                  :key="index"
                  :text="item.dictLabel"
                  :data-label="item.dictLabel"
                  plain
                  size="medium"
                  closable
                  type="primary"
                  style="margin: 4px; display: inline-block; cursor: move"
                  @close="() => {
                    unselectedList.push(item);
                    selectedList.splice(index, 1);
                  }"
                ></u-tag>
                 
              </template>
            </template>
            <template v-else>
              <view
                class="empty-state"
                style="
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding: 24rpx;
                "
              >
                <u-icon name="info-circle" color="#999" size="48"></u-icon>
                <text
                  class="empty-text"
                  style="margin-top: 20rpx; color: #999; font-size: 28rpx"
                  >暂无已选科目</text
                >
              </view>
            </template>
          </view>
        </view>

        <view
          class="tag-wrapper"
          style="
            background-color: #fff;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            margin-bottom: 16px;
            position: relative;
            border: 1px solid rgba(0, 0, 0, 0.05);
          "
        >
          <view
            class="section-title"
            style="
              font-size: 16px;
              font-weight: 600;
              color: #333;
              margin-bottom: 16px;
              padding-left: 10px;
              border-left: 4px solid #4caf50;
              display: flex;
              align-items: center;
            "
            >点击添加科目</view
          >
          <view ref="selectedTags" class="tag-list">
            <template v-if="unselectedList && unselectedList.length > 0">
              <u-tag
                :text="item.dictLabel"
                :data-label="item.dictLabel"
                plain
                size="medium"
                type="primary"
                v-for="(item, index) in unselectedList"
                :key="index"
                style="
                  margin: 6px;
                  display: inline-block;
                  cursor: pointer;
                  position: relative;
                  border-radius: 6px;
                "
                @click="addSubject(index)"
                icon="plus"
                :iconStyle="{
                  color: '#2979ff',
                  fontSize: '12px',
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                }"
              >
              </u-tag>
            </template>
            <template v-else>
              <view
                class="empty-state"
                style="
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding: 24rpx;
                "
              >
                <u-icon name="info-circle" color="#999" size="48"></u-icon>
                <text
                  class="empty-text"
                  style="margin-top: 20rpx; color: #999; font-size: 28rpx"
                  >暂无可选科目</text
                >
              </view>
            </template>
          </view>
        </view>
      </view>
    </scroll-view>

    <view
      style="
        position: fixed;
        bottom: 20px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        padding: 0 20px;
        z-index: 100;
      "
    >
      <u-button
        type="success"
        text="我已选好了"
        style="width: 100%; background-color: #4caf50"
        shape="circle"
        @click="confirmSelection"
      ></u-button>
    </view>
  </view>
</template>

<script>
import Sortable from "sortablejs";

import * as DictApi from "@/api/dict";

export default {
  mounted() {
    // 在 nextTick 中初始化，确保 DOM 已经渲染
    this.$nextTick(() => {
      this.initSortable();
    });

    // #ifdef APP-PLUS
    this.initTagPositions();
    // #endif
  },
  components: {},
  data() {
    return {
      selectedList: [],
      unselectedList: [],
      indexList: [],
      selectedIndex: undefined,
      sortableInstance: null,
      tagPositions: null,
      dragStartIndex: -1,
      dragEndIndex: -1,
      draggingIndex: -1,
      positions: [],
      startX: 0,
      startY: 0,
      itemWidth: 100, // 每个项目的宽度
      itemHeight: 40, // 每个项目的高度
      gridColumns: 3, // 网格列数
      currentDrag: -1,
      originalIndex: -1,
      itemRects: [],
      moveX: 0,
      moveY: 0,
      isMoving: false,
      dragTimer: null,
    };
  },
  onLoad(options) {
    // 检查是否有examId参数
    if (!options || !options.code) {
      uni.navigateBack();
      return;
    }
    // 加载考试项目
    this.initData(options.code);
  },
  methods: {
    addSubject(index) {
      // 获取点击的科目
      const subject = this.unselectedList[index];

      // 如果已选列表包该科目
      if (!this.selectedList.includes(subject)) {
        // 添加到已选列表
        this.selectedList.push(subject);
        // 从未选列表中移除
        this.unselectedList.splice(index, 1);
      } else {
        // 如果已经存在,提示已添加
        uni.showToast({
          title: "该科目已添加",
          icon: "none",
          duration: 1500,
        });
      }
    },
    initSortable() {
      // #ifdef H5 
      const query = uni.createSelectorQuery().in(this);
      query
        .select(".tag-list")
        .boundingClientRect((data) => {
          if (data) {
            const el = document.querySelector(".tag-list");
            if (el) {
              // 如果已存在实例，先销毁
              if (this.sortableInstance) {
                this.sortableInstance.destroy();
              }

              this.sortableInstance = new Sortable(el, {
                animation: 150,
                onEnd: ({ oldIndex, newIndex }) => {
                  // 创建一个新的数组副本
                  const newList = Array.from(this.selectedList);
                  const itemToMove = newList.splice(oldIndex, 1)[0];
                  newList.splice(newIndex, 0, itemToMove);

                  // 使用 setTimeout 确保在下一个事件循环中更新
                  setTimeout(() => {
                    // 完全替换数组
                    this.selectedList = [];
                    this.$nextTick(() => {
                      this.selectedList = newList;
                    });
                  }, 0);

                  // 打印日志以验证数据变化
                  console.log("数据更新:", {
                    oldIndex,
                    newIndex,
                    newList,
                  });
                },
              });
            }
          }
        })
        .exec();
      // #endif

      // #ifdef APP-PLUS
      const query = uni.createSelectorQuery().in(this);
      query
        .selectAll('.u-tag')
        .boundingClientRect(data => {
          if (data && data.length) {
            this.tagPositions = data.map(item => ({
              left: item.left,
              top: item.top,
              width: item.width,
              height: item.height
            }));
          }
        })
        .exec();

      // 添加触摸事件处理
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this);
        query.select('.tag-list').boundingClientRect(data => {
          if (!data) return;
          
          const tagList = data;
          let startX = 0;
          let startY = 0;
          let initialIndex = -1;
          let currentIndex = -1;
          
          // 使用原生触摸事件
          uni.$on('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            
            // 找到触摸的标签索引
            const target = e.target;
            if (target && target.classList.contains('u-tag')) {
              initialIndex = this.selectedList.findIndex(item => 
                item.dictLabel === target.dataset.label
              );
              target.style.opacity = '0.6';
              target.style.transform = 'scale(1.1)';
            }
          });

          uni.$on('touchmove', (e) => {
            if (initialIndex === -1) return;
            
            const touch = e.touches[0];
            const moveX = touch.clientX - startX;
            const moveY = touch.clientY - startY;
            
            const target = e.target;
            if (target && target.classList.contains('u-tag')) {
              target.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
              
              currentIndex = this.getIndexAtPosition(touch.clientX, touch.clientY);
            }
          });

          uni.$on('touchend', () => {
            if (initialIndex === -1) return;
            
            if (currentIndex !== -1 && currentIndex !== initialIndex) {
              // 更新数据
              const newList = Array.from(this.selectedList);
              const [removed] = newList.splice(initialIndex, 1);
              newList.splice(currentIndex, 0, removed);
              this.selectedList = newList;
            }
            
            initialIndex = -1;
            currentIndex = -1;
          });
        }).exec();
      });
      // #endif
    },
    initData(code) {
      DictApi.getDictList("subject_" + code).then((res) => {
        this.selectedList = res.data;
      });
      // this.indexList = [
      //   "语文",
      //   "数学",
      //   "英语",
      //   "物理",
      //   "化学",
      //   "生物",
      //   "政治",
      //   "历史",
      //   "地理",
      // ];
      // this.selectedIndex = 0;
      // this.selectedList = ["语文", "数", "英语"];
      // console.log(this.selectedList);
    },
    closeTag(index) {
      this.selectedList.splice(index, 1);
    },
    selectItem(index) {
      this.selectedIndex = index;
      // 如果已经选择了该科目,则不重复添加
      if (this.selectedList.includes(this.indexList[index])) {
        return;
      }
      // 加选中的科目到selectedList
      this.selectedList.push(this.indexList[index]);
    },
    getIndexAtPosition(x, y) {
      if (!this.tagPositions) return -1;
      
      for (let i = 0; i < this.tagPositions.length; i++) {
        const pos = this.tagPositions[i];
        if (x >= pos.left && x <= pos.left + pos.width &&
            y >= pos.top && y <= pos.top + pos.height) {
          return i;
        }
      }
      return -1;
    },
    confirmSelection() {
      if (this.selectedList.length === 0) {
        uni.showToast({
          title: '请至少选择一个科目',
          icon: 'none'
        });
        return;
      }

      // 这里添加你的确认逻辑
      uni.navigateBack({
        delta: 1
      });
    },
    initTagPositions() {
      // #ifdef APP-PLUS
      const systemInfo = uni.getSystemInfoSync();
      const containerWidth = systemInfo.windowWidth - 32; // 减去右padding
      this.itemWidth = (containerWidth - 20) / this.gridColumns; // 20是列间距总和
      
      this.selectedList = this.selectedList.map((item, index) => {
        const row = Math.floor(index / this.gridColumns);
        const col = index % this.gridColumns;
        const x = col * (this.itemWidth + 10); // 10是列间距
        const y = row * (this.itemHeight + 10); // 10是行间距
        
        return {
          ...item,
          x,
          y,
          initialX: x,
          initialY: y,
          index
        };
      });
      
      // 保存所有可能的位置
      this.positions = this.selectedList.map(item => ({
        x: item.x,
        y: item.y,
        index: item.index
      }));
      // #endif
    },
    onDragStart(e, index) {
      this.draggingIndex = index;
    },

    onDragMove(e, index) {
      if (this.draggingIndex === -1) return;
      
      const { x, y } = e.detail;
      const currentPosition = { x, y };
      
      // 找到最近的位置
      let nearestIndex = -1;
      let minDistance = Infinity;
      
      this.positions.forEach((position, idx) => {
        if (idx === index) return;
        
        const distance = Math.sqrt(
          Math.pow(currentPosition.x - position.x, 2) +
          Math.pow(currentPosition.y - position.y, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = idx;
        }
      });
      
      // 如果找到合适的位置且距离小于阈值，则交换位置
      if (nearestIndex !== -1 && minDistance < this.itemWidth / 2) {
        this.swapItems(index, nearestIndex);
      }
    },

    onDragEnd() {
      // 重置所有项目到网格位置
      this.draggingIndex = -1;
      this.initTagPositions();
    },

    swapItems(fromIndex, toIndex) {
      const newList = [...this.selectedList];
      const [removed] = newList.splice(fromIndex, 1);
      newList.splice(toIndex, 0, removed);
      this.selectedList = newList;
      
      // 更新位置信息
      this.$nextTick(() => {
        this.initTagPositions();
      });
    },

    dragStart(event, index) {
      // 防止多指触控
      if (event.touches.length > 1) return
      
      const touch = event.touches[0]
      this.startX = touch.clientX
      this.startY = touch.clientY
      this.currentDrag = index
      this.isMoving = true
      
      // 添加触感反馈
      plus.device.vibrate(10)
      
      // 获取元素位置信息
      uni.createSelectorQuery()
        .in(this)
        .selectAll('.subject-item')
        .boundingClientRect(rects => {
          this.itemRects = rects
        })
        .exec()
    },

    dragMove(event, index) {
      if (this.currentDrag === -1) return
      
      const touch = event.touches[0]
      this.moveX = touch.clientX - this.startX
      this.moveY = touch.clientY - this.startY
      
      // 使用节流优化性能
      if (this.dragTimer) return
      this.dragTimer = setTimeout(() => {
        this.checkPosition(touch, index)
        this.dragTimer = null
      }, 50)
    },

    checkPosition(touch, index) {
      if (!this.itemRects[index]) return
      
      const currentRect = {
        left: this.itemRects[index].left + this.moveX,
        top: this.itemRects[index].top + this.moveY,
        width: this.itemRects[index].width,
        height: this.itemRects[index].height
      }
      
      let targetIndex = -1
      let minDistance = Infinity
      
      this.itemRects.forEach((rect, idx) => {
        if (idx === index) return
        
        const distance = this.getDistance(
          currentRect.left + currentRect.width / 2,
          currentRect.top + currentRect.height / 2,
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        )
        
        if (distance < minDistance && distance < rect.width) {
          minDistance = distance
          targetIndex = idx
        }
      })
      
      if (targetIndex !== -1) {
        this.swapItems(index, targetIndex)
        plus.device.vibrate(5) // 轻微振动反馈
      }
    },

    dragEnd() {
      if (this.currentDrag === -1) return
      
      this.isMoving = false
      this.moveX = 0
      this.moveY = 0
      
      // 使用 nextTick 确保动画正常执行
      this.$nextTick(() => {
        setTimeout(() => {
          this.currentDrag = -1
        }, 300)
      })
    },

    getDistance(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    },

    swapItems(fromIndex, toIndex) {
      const newList = [...this.selectedList]
      const temp = newList[fromIndex]
      newList[fromIndex] = newList[toIndex]
      newList[toIndex] = temp
      this.selectedList = newList
      
      // 更新位置信息
      this.$nextTick(() => {
        uni.createSelectorQuery()
          .in(this)
          .selectAll('.subject-item')
          .boundingClientRect(rects => {
            this.itemRects = rects
          })
          .exec()
      })
    },

    handleClose(index) {
      if (this.isMoving) return // 拖动时禁止关闭
      this.unselectedList.push(this.selectedList[index])
      this.selectedList.splice(index, 1)
    },

    getDragStyle(index) {
      if (index === this.currentDrag) {
        return {
          transform: `translate3d(${this.moveX}px, ${this.moveY}px, 0)`,
          transition: this.isMoving ? 'none' : 'transform 0.3s'
        }
      }
      return {}
    }
  },
  beforeDestroy() {
    // #ifdef APP-PLUS
    uni.$off('touchstart');
    uni.$off('touchmove');
    uni.$off('touchend');
    // #endif
  },
  watch: {
    selectedList: {
      handler() {
        // #ifdef APP-PLUS
        this.$nextTick(() => {
          this.initTagPositions();
        });
        // #endif
      },
      deep: true
    }
  },
  // 页面显示时也重新计算位置
  onShow() {
    // #ifdef APP-PLUS
    this.$nextTick(() => {
      this.initTagPositions();
    });
    // #endif
  }
};
</script>

<style lang="scss">
.page-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;
}

.scroll-content {
  flex: 1;
  height: 0; // 重要：防止scroll-view溢出
  ::-webkit-scrollbar {
    display: none; // 隐藏webkit浏览器的滚动条
    width: 0;
    height: 0;
  }
}

.content-wrapper {
  padding: 16px;
  padding-bottom: 80px; // 为底部按钮留出合适空间
}

.tag-wrapper {
  isolation: isolate; // 创建新的层叠上下文
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-left: 10px;
  border-left: 4px solid #4caf50;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
  background: #fff;

  // 只有带有 --with-border 修饰符的标题才显示底部横线
  &.section-title--with-border::after {
    content: '';
    position: absolute;
    left: -16px;
    right: -16px;
    bottom: -8px;
    height: 1px;
    background: rgba(0, 0, 0, 0.05);
  }
}

:deep(.u-tag) {
  z-index: 1;
  margin: 6px;
  border-radius: 6px;
}

.movable-area {
  background-color: transparent;
  position: relative;
  width: 100%;
  min-height: 120px;
}

.movable-view {
  z-index: 1;
  transition: transform 0.2s;
  
  &.dragging {
    z-index: 2;
    transition: none;
  }
}

:deep(.u-tag) {
  display: inline-block;
  white-space: nowrap;
  margin: 0 !important;
}

.tag-list {
  position: relative;
  min-height: 120px;
}

/* #ifdef APP-PLUS */
.grid-container {
  position: relative;
  width: 100%;
  padding: 10px;
}

.movable-area {
  width: 100%;
  height: 300px; // 根据实际内容调整高度
  position: relative;
}

.movable-view {
  position: absolute;
  z-index: 1;
  padding: 5px;
  
  &.dragging {
    z-index: 2;
    
    .subject-item {
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }
}

.subject-item {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  .subject-text {
    font-size: 14px;
    color: #333;
    max-width: 80%;
    text-align: center;
  }
  
  .close-btn {
    position: absolute;
    right: 8px;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border-radius: 50%;
    font-size: 16px;
    color: #999;
    background-color: rgba(0, 0, 0, 0.05);
  }
}
/* #endif */

/* #ifdef APP-PLUS */
.subjects-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 12px;
  gap: 12px;
}

.subject-item {
  position: relative;
  background: #fff;
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid #eee;
  min-width: 80px;
  text-align: center;
  touch-action: none;
  will-change: transform;
  transition: all 0.3s ease;
  
  &.dragging {
    z-index: 100;
    opacity: 0.9;
    background: #f8f8f8;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &.item-moving {
    transition: transform 0.3s ease;
  }
  
  .subject-text {
    font-size: 14px;
    color: #333;
    line-height: 1.4;
  }
  
  .close-btn {
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.06);
    color: #666;
    font-size: 16px;
    
    &:active {
      background: rgba(0, 0, 0, 0.1);
    }
  }
}
/* #endif */
</style>
