<template>
  <view>
    <u-row>
      <u-col span="4" style="background-color: #f5f5f5">
        <u-list>
          <scroll-view scroll-y style="height: calc(100vh - 100px)">
            <u-list-item v-for="(item, index) in examTypeList" :key="index">
              <u-cell
                :title="item.dictLabel"
                @click="selectItem(item)"
                :customStyle="{
                  backgroundColor: '#f5f5f5',
                  borderBottom: '1px solid #eee',
                }"
                :titleStyle="{
                  color:
                    selectedExamType === item.dictValue ? '#4CAF50' : '#333',
                }"
              >
              </u-cell>
            </u-list-item>
          </scroll-view>
        </u-list>
      </u-col>
      <u-col span="8" style="align-self: flex-start; padding: 10px">
        <view ref="selectedTags" class="tag-list">
          <template v-if="unselectedList && unselectedList.length > 0">
            <u-tag
              :text="item.dictLabel"
              plain
              size="medium"
              :type="item.isSelected ? 'success' : 'primary'"
              v-for="(item, index) in unselectedList"
              :key="index"
              style="
                margin: 5px;
                display: inline-block;
                cursor: pointer;
                position: relative;
              "
              @click="addSubject(item)"
            >
            </u-tag>
          </template>
          <template v-else>
            <view class="empty-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40rpx;">
              <u-icon name="info-circle" color="#999" size="48"></u-icon>
              <text class="empty-text" style="margin-top: 20rpx; color: #999; font-size: 28rpx;">暂无可选考试科目</text>
            </view>
          </template>
        </view>
      </u-col>
    </u-row>
  </view>
</template>

<script>
import Sortable from "sortablejs";
import Navbar from "@/components/navbar/Navbar";
import * as DictApi from "@/api/dict";
import * as UserApi from "@/api/user";

export default {
  mounted() {},
  components: {
    Navbar,
  },
  data() {
    return {
      selectedList: ["数学谢谢谢谢", "语文", "英语", "物理", "化学"],
      unselectedList: [],
      indexList: [],
      selectedIndex: undefined,
      examTypeList: [],
      selectedExamType: null,
      sortableInstance: null,
      userExamCodes: [],
    };
  },
  onLoad() {
    // 加载考试项目
    this.initData();
  },
  methods: {
    addSubject(item) {
      uni.navigateTo({
        url: `/pages/subject/subject?code=${item.dictCode}&selectedCodes=${this.userExamCodes}`,
      });
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
    },
    async initData() {
      // Get user info first
      try {
        const userInfo = await UserApi.getInfo();
        this.userExamCodes = userInfo.data?.examCode || [];
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        this.userExamCodes = [];
      }

      // Then get exam types
      DictApi.getDictList("exam_type").then((res) => {
        this.examTypeList = res.data;
        if (this.examTypeList.length > 0) {
          this.selectItem(this.examTypeList[0]);
        }
      });
    },
    closeTag(index) {
      this.selectedList.splice(index, 1);
    },
    selectItem(item) {
      this.selectedExamType = item.dictValue;
      DictApi.getDictList("exam_list_" + item.dictValue).then((res) => {
        const examList = Array.isArray(res.data) ? res.data : [];
        this.unselectedList = examList.map(item => ({
          ...item,
          isSelected: this.userExamCodes.includes(item.dictCode)
        }));
      });
    },
  },
};
</script>

<style lang="scss">
</style>
