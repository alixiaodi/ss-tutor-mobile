<template>
  <view class="subject-container">
    <Navbar title="选择科目" bgColor="#fff" :hideBtn="false" :h5Show="true"></Navbar>
    <!-- 我的科目区域 -->
    <view class="my-subjects">
      <view class="section-title"> 我的科目 </view>

      <view class="subject-list">
        <view
          v-for="(subject, index) in selectedSubjects"
          :key="index"
          class="subject-item selected"
        >
          <text>{{ subject.name }}</text>
          <u-icon
            name="close"
            size="20"
            color="#999"
            @click="removeSubject(index)"
          ></u-icon>
        </view>
      </view>
    </view>

    <!-- 添加科目区域 -->
    <view class="add-subjects">
      <view class="section-title">点击添加科目</view>
      <view class="subject-list">
        <view
          v-for="(subject, index) in availableSubjects"
          :key="index"
          class="subject-item"
        >
          <text>{{ subject.name }}</text>
          <u-icon name="plus" size="20" color="#999" @click="addSubject(index)"></u-icon>
        </view>
      </view>
    </view>

    <!-- 底部确认按钮 -->
    <view class="bottom-button">
      <u-button
        type="primary"
        text="我选好了"
        :custom-style="{
          width: '100%',
          height: '88rpx',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#32baa5',
          color: '#ffffff',
        }"
        @click="confirmSelection"
      ></u-button>
    </view>
  </view>
</template>

<script>
import * as SubjectApi from "@/api/subject";
import * as SubjectUserApi from "@/api/subjectUser";
import Navbar from "@/components/navbar/Navbar";
export default {
  components: {
    Navbar,
  },
  name: "subject",
  data() {
    return {
      examId: "",
      selectedSubjects: [],
      availableSubjects: [],
    };
  },
  onLoad(options) {
    this.examId = options.code;
    SubjectApi.list(this.examId).then((res) => {
      const allSubjects = res.data.map((item) => ({
        id: item.id,
        name: item.name,
      }));

      this.selectedSubjects = [];
      this.availableSubjects = [];

      SubjectUserApi.getSubject().then((userRes) => {
        if (!userRes.data.examCode || userRes.data.examCode !== this.examId) {
          this.selectedSubjects = [...allSubjects];
          return;
        }

        const selectedIds = userRes.data.subjects.map((item) => Number(item.subjectCode));
        allSubjects.forEach((subject) => {
          if (selectedIds.includes(subject.id)) {
            if (!this.selectedSubjects.some((item) => item.id === subject.id)) {
              this.selectedSubjects.push(subject);
            }
          } else {
            this.availableSubjects.push(subject);
          }
        });
      });
    });
  },
  methods: {
    addSubject(index) {
      const subject = this.availableSubjects[index];
      this.selectedSubjects.push({
        id: subject.id,
        name: subject.name,
      });
      this.availableSubjects.splice(index, 1);
    },
    removeSubject(index) {
      const subject = this.selectedSubjects[index];
      this.availableSubjects.push({
        id: subject.id,
        name: subject.name,
      });
      this.selectedSubjects.splice(index, 1);
    },
    confirmSelection() {
      if (this.selectedSubjects.length === 0) {
        uni.showToast({
          title: "请至少选择一个科目",
          icon: "none",
        });
        return;
      }
      SubjectUserApi.addSubject({
        examId: this.examId,
        subjectIds: this.selectedSubjects.map((item) => item.id),
      }).then((res) => {
        if (res.code === 200) {
          uni.showToast({
            title: "选择成功",
            icon: "success",
            duration: 2000,
            success: () => {
              setTimeout(() => {
                uni.reLaunch({
                  url: "/pages/index/index",
                });
              }, 2000);
            },
          });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.subject-container {
  min-height: 100vh;
  background-color: #fff;
  padding: 0 20rpx;

  .section-title {
    font-size: 28rpx;
    color: #333;
    margin: 30rpx 0 20rpx 0;
    font-weight: bold;
  }

  .subject-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    width: 100%;

    .subject-item {
      width: 48%;
      margin: 1%;
      background-color: #fff;
      padding: 20rpx 0;
      border-radius: 6rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      border: 1px solid #eee;
      position: relative;
      box-sizing: border-box;

      &.selected {
        background-color: rgba(50, 186, 165, 0.1);
        border: 1px solid #32baa5;
      }

      text {
        font-size: 24rpx;
        color: #333;
      }

      .u-icon {
        position: absolute;
        right: 15rpx;
        color: #32baa5;
      }
    }
  }

  .bottom-button {
    position: fixed;
    bottom: 30rpx;
    left: 20rpx;
    right: 20rpx;
    z-index: 99;
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
