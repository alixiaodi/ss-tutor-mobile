<!-- 蓝色简洁登录页面 -->
<template>
  <view class="t-login">
    <!-- 页面装饰图片 -->
    <image class="img-a" src="/static/img/b-1.png"></image>
    <image class="img-b" src="/static/img/b-2.png"></image>
    <!-- 标题 -->
    <view class="t-b">{{ title }}</view>
    <view class="t-b2">{{ subTitle }}</view>
    <form class="cl">
      <!-- 登录账号 -->
      <view class="login-form-item">
        <u-input
          v-model="phoneNumber"
          type="number"
          placeholder="请输入手机号"
          maxlength="11"
        >
          <u-icon slot="prefix" name="phone" size="35px"></u-icon>
        </u-input>
      </view>
      <!-- 图形验证码 -->
      <view v-if="showCaptcha" class="login-form-item t-captcha">
        <u-input
          v-model="captchaCode"
          type="number"
          placeholder="请输入验证码"
          maxlength="4"
        >
          <u-icon slot="prefix" name="fingerprint" size="35px"></u-icon>
        </u-input>
        <image :src="captcha" @click="getCaptcha" class="t-captcha-img"></image>
      </view>
      <view class="login-form-item">
        <u-input
          v-model="smsCode"
          type="number"
          placeholder="请输入验证码"
          maxlength="6"
        >
          <u-icon slot="prefix" name="lock" size="35px"></u-icon>
          <!-- #ifdef H5 -->
          <u-button
            slot="suffix"
            @tap="sendSmsCode"
            size="mini"
            type="primary"
            class="sms-button"
            :disabled="smsCodeCountdown > 0"
            :text="
              smsCodeCountdown > 0
                ? `${smsCodeCountdown}s后重新发送`
                : '发送验证码'
            "
            :custom-style="{
              borderRadius: '20px',
              padding: '0 15px',
              fontSize: '12px',
              height: '30px',
              lineHeight: '30px',
              minWidth: '100px',
              transition: 'all 0.3s',
            }"
          ></u-button>
          <!-- #endif -->
          <!-- #ifdef APP-PLUS -->
          <view
            slot="suffix"
            @tap="sendSmsCode"
            :style="{
              color: smsCodeCountdown > 0 ? '#999' : '#2979ff',
              fontSize: '28rpx',
              paddingRight: '20rpx',
            }"
          >
            {{ smsCodeCountdown > 0 ? `${smsCodeCountdown}s` : "发送验证码" }}
          </view>
          <!-- #endif -->
        </u-input>
      </view>

      <button @tap="login()">登 录</button>
    </form>
  </view>
</template>
<script>
import * as CaptchaApi from "@/api/captcha";
import * as SmsApi from "@/api/sms";
import { isEmpty } from "@/utils/verify.js";

export default {
  data() {
    return {
      showCaptcha: false,
      smsCodeCountdown: 0,
      title: "智考导师",
      subTitle: "欢迎登录智考导师，开启您的自考卓越之旅！",
      smsCode: null,
      // 图形验证码信息
      captcha: null,
      // 登录账号
      phoneNumber: "",
      username: "admin",
      // 密码
      password: "admin123",
      // 图形验证码
      captchaCode: "",
      uuid: "",
    };
  },
  created() {
    // 获取图形验证码
    // this.getCaptcha();
  },
  methods: {
    // 发送验证码
    sendSmsCode() {
      // Check if countdown is active
      if (this.smsCodeCountdown > 0) {
        return;
      }

      // Validate phone number
      if (isEmpty(this.phoneNumber)) {
        uni.$u.toast("请输入手机号码");
        return;
      }
      this.showCaptcha = true;

      // Validate captcha code
      if (isEmpty(this.captchaCode)) {
        uni.$u.toast("请输入图形验证码");
        this.getCaptcha();
        return;
      }

      //   发送手机验证码
      SmsApi.sendCode({
        phoneNumber: this.phoneNumber,
        code: this.captchaCode,
        codeId: this.uuid,
      }).then((result) => {
        if (result.code == 200) {
          uni.$u.toast("验证码发送成功");
          // Start countdown
          this.smsCodeCountdown = 60;
          const countdownTimer = setInterval(() => {
            this.smsCodeCountdown--;
            if (this.smsCodeCountdown <= 0) {
              clearInterval(countdownTimer);
            }
          }, 1000);
        }
      });
    },
    // 获取图形验证码
    getCaptcha() {
      const app = this;
      CaptchaApi.image().then((result) => {
        app.captcha = "data:image/gif;base64," + result.img;
        app.uuid = result.uuid;
      });
    },
    // 验证表单内容
    validItem() {
      const app = this;
      if (isEmpty(app.username)) {
        uni.$u.toast("请输入登录用户名");
        return false;
      }
      if (isEmpty(app.password)) {
        uni.$u.toast("请输入登录密码");
        return false;
      }
      if (isEmpty(app.captchaCode)) {
        uni.$u.toast("请输入验证码");
        return false;
      }
      return true;
    },
    // 确认登录
    login() {
      const app = this;
      let valid = app.validItem();
      if (valid) {
        app.isLoading = true;
        app.$store
          .dispatch("Login", {
            tel: app.phoneNumber,
            code: app.smsCode,
          })
          .then((result) => {
            uni.switchTab({
              url: "/pages/index/index",
              fail(err) {
                console.log(err);
              },
            });
          })
          .catch((err) => {
            app.captchaCode = "";
            app.getCaptcha();
          })
          .finally(() => (app.isLoading = false));
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import "index.scss";
</style>
