<template>
  <view>
    <Navbar title="选择考试" bgColor="#fff" :hideBtn="false" :h5Show="true"></Navbar>
    <u-row>
      <u-col span="4" style="background-color: #f5f5f5">
        <u-list>
          <scroll-view scroll-y style="height: calc(100vh - 100px)">
            <u-list-item v-for="(item, index) in subjectList" :key="index">
              <u-cell
                :title="item.name"
                @click="selectItem(item)"
                :customStyle="{
                  backgroundColor: '#f5f5f5',
                  borderBottom: '1px solid #eee',
                }"
                :titleStyle="{
                  color: selectedExamType === item.id ? '#4CAF50' : '#333',
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
              :text="item.name"
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
            <view
              class="empty-state"
              style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40rpx;
              "
            >
              <u-icon name="info-circle" color="#999" size="48"></u-icon>
              <text
                class="empty-text"
                style="margin-top: 20rpx; color: #999; font-size: 28rpx"
                >暂无可选考试科目</text
              >
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
import * as SubjectApi from "@/api/subject";
export default {
  mounted() {},
  components: {
    Navbar,
  },
  data() {
    return {
      selectedList: [],
      unselectedList: [],
      indexList: [],
      selectedIndex: undefined,
      selectedExamType: null,
      sortableInstance: null,
      userExamCodes: [],
      subjectList: [],
    };
  },
  onLoad() {
    this.getSubjectList();
    this.initData();
  },
  methods: {
    addSubject(item) {
      uni.navigateTo({
        url: `/pages/subject/subject?code=${item.id}&selectedCodes=${this.userExamCodes}`,
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
        console.error("Failed to fetch user info:", error);
        this.userExamCodes = [];
      }
    },
    closeTag(index) {
      this.selectedList.splice(index, 1);
    },
    async selectItem(item) {
      this.selectedExamType = item.id;
      console.log("选中的科目信息:", {
        id: item.id,
        name: item.name,
        path: item.path,
        isDefaultSelect: this.subjectList[0]?.id === item.id,
      });

      try {
        const res = await SubjectApi.list(item.id);
        if (res.code === 200) {
          // 直接使用返回的数据设置到右侧列表
          this.unselectedList = res.data.map((item) => ({
            ...item,
            isSelected: this.userExamCodes.includes(item.id),
          }));
        } else {
          uni.showToast({
            title: res.msg || "获取科目列表失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("获取科目列表失败:", error);
        uni.showToast({
          title: "获取科目列表失败",
          icon: "none",
        });
      }
    },
    async getSubjectList() {
      try {
        const res = await SubjectApi.list();
        if (res.code === 200) {
          this.subjectList = res.data || [];
          if (this.subjectList.length > 0) {
            this.selectItem(this.subjectList[0]);
          }
        } else {
          uni.showToast({
            title: res.msg || "获取科目列表失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("获取科目列表出错:", error);
        uni.showToast({
          title: "获取科目列表失败",
          icon: "none",
        });
      }
    },
  },
};
</script>

<style lang="scss"></style>
