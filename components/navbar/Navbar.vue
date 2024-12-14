<template>
  <block v-if="isShow()">
    <view
      v-if="hideBtn"
      class="u-navbar"
      :style="{ backgroundColor: bgColor, textAlign: 'center' }"
    >
      <view
        class="u-navbar__placeholder"
        v-if="fixed"
        :style="{
          height: $u.addUnit($u.getPx(height) + $u.sys().statusBarHeight, 'px'),
        }"
      ></view>
      <view :class="[fixed && 'u-navbar--fixed']">
        <u-status-bar v-if="safeAreaInsetTop" :bgColor="bgColor"></u-status-bar>
        <view
          class="u-navbar__content"
          :class="[border && 'u-border-bottom']"
          :style="{ height: contentHeight, backgroundColor: bgColor }"
        >
          <view
            class="u-navbar__content__left"
            hover-class="u-navbar__content__left--hover"
            hover-start-time="150"
            style="position: relative"
          >
            <text
              class="u-line-1 u-navbar__content__title"
              :style="[
                { height: contentHeight, lineHeight: contentHeight, margin: '0 auto' },
                $u.addStyle(titleStyle),
              ]"
            >
              {{ title }}
            </text>
          </view>
        </view>
      </view>
    </view>
    <u-navbar
      v-else
      :title="title"
      :autoBack="false"
      :placeholder="true"
      :bgColor="bgColor"
      @leftClick="handleBack"
    ></u-navbar>
  </block>
</template>

<script>
import props from "./props.js";
/**
 * Navbar 自定义导航栏
 * @property {Boolean}			h5Show				是否在h5模式下显示 （默认 false ）
 * @property {Boolean}			hideBtn				是否隐藏返回按钮 （默认 false ）
 */
export default {
  mixins: [props],
  props: {
    h5Show: Boolean,
    hideBtn: Boolean,
    back: Boolean,
    home: Boolean,
  },
  data() {
    return {
      systemInfo: this.$store.getters.getSystemInfo,
      statusBarHeight: uni.$u.addUnit(
        uni.$u.getPx(this.height) + uni.$u.sys().statusBarHeight,
        "px"
      ),
      contentHeight: uni.$u.addUnit(this.height),
    };
  },
  methods: {
    isShow() {
      if (this.systemInfo.uniPlatform == "web") {
        return this.h5Show;
      }
      return true;
    },
    handleBack() {
      // 判断是否可以返回
      const pages = getCurrentPages();

      // H5环境下使用 history.back()
      if (this.systemInfo.uniPlatform === "web") {
        history.back();
        return;
      }

      // 非H5环境下使用 navigateBack
      if (pages.length > 1) {
        uni.navigateBack({
          delta: 1,
        });
      } else if (currentRoute === "/pages/index/index") {
        // 已经在首页时不做任何操作
        return;
      } else {
        // 其他情况跳转到首页
        uni.switchTab({
          url: "/pages/index/index",
        });
      }
    },
  },
  created() {
    // 在组件创建时记录当前页面的上一页
    const pages = getCurrentPages();
    if (pages.length > 1) {
      const previousPage = pages[pages.length - 2];
      const previousRoute = `/${previousPage.route}`;
      // 保存包含参数的完整路径
      const options = previousPage.options;
      let query = "";
      if (Object.keys(options).length > 0) {
        query =
          "?" +
          Object.entries(options)
            .map(([key, value]) => `${key}=${value}`)
            .join("&");
      }
      uni.setStorageSync("previousPage", previousRoute + query);
    }
  },
};
</script>

<style lang="scss" scoped>
.u-navbar {
  &--fixed {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    z-index: 11;
  }

  &__content {
    @include flex(row);
    align-items: center;
    height: 44px;
    background-color: #9acafc;
    position: relative;
    justify-content: center;

    &__left,
    &__right {
      padding: 0 13px;
      position: absolute;
      top: 0;
      bottom: 0;
      @include flex(row);
      align-items: center;
    }

    &__left {
      left: 0;

      &--hover {
        opacity: 0.7;
      }

      &__text {
        font-size: 15px;
        margin-left: 3px;
      }
    }

    &__title {
      text-align: center;
      font-size: 16px;
      color: $u-main-color;
    }

    &__right {
      right: 0;

      &__text {
        font-size: 15px;
        margin-left: 3px;
      }
    }
  }
}
</style>
