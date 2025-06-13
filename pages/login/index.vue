<!-- 蓝色简洁登录页面 -->
<template>
  <view class="t-login">
    <!-- 页面背景图片 -->
    <image class="login-background" src="/static/img/login_background.png"></image>
    <!-- 标题 -->
    <view class="t-b">{{ title }}</view>
    <view class="t-b2">{{ subTitle }}</view>
    
    <!-- Login type toggle -->
    <view class="login-type-toggle">
      <view 
        class="toggle-item" 
        :class="{'active': loginType === 'email'}" 
        @tap="loginType = 'email'"
      >邮箱登录</view>
      <view 
        class="toggle-item" 
        :class="{'active': loginType === 'phone'}" 
        @tap="loginType = 'phone'"
      >手机号登录</view>
    </view>
    
    <form class="cl">
      <!-- Email Login Form -->
      <block v-if="loginType === 'email'">
        <view class="login-form-item">
          <u-input
            v-model="email"
            placeholder="请输入邮箱"
          >
            <u-icon slot="prefix" name="email" size="35px"></u-icon>
          </u-input>
        </view>
        <view class="login-form-item">
          <u-input
            v-model="emailCode"
            type="number"
            placeholder="请输入验证码"
            maxlength="6"
          >
            <u-icon slot="prefix" name="lock" size="35px"></u-icon>
            <!-- #ifdef H5 -->
            <u-button
              slot="suffix"
              @tap="sendEmailCode"
              size="mini"
              type="primary"
              class="sms-button"
              :disabled="emailCodeCountdown > 0"
              :text="
                emailCodeCountdown > 0
                  ? `${emailCodeCountdown}s后重新发送`
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
              @tap="sendEmailCode"
              :style="{
                color: emailCodeCountdown > 0 ? '#999' : '#ff7e45',
                fontSize: '28rpx',
                paddingRight: '20rpx',
              }"
            >
              {{ emailCodeCountdown > 0 ? `${emailCodeCountdown}s` : "发送验证码" }}
            </view>
            <!-- #endif -->
          </u-input>
        </view>
      </block>
      
      <!-- Phone Login Form -->
      <block v-else>
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
                color: smsCodeCountdown > 0 ? '#999' : '#ff7e45',
                fontSize: '28rpx',
                paddingRight: '20rpx',
              }"
            >
              {{ smsCodeCountdown > 0 ? `${smsCodeCountdown}s` : "发送验证码" }}
            </view>
            <!-- #endif -->
          </u-input>
        </view>
      </block>

      <button @tap="login()">登 录</button>
    </form>
  </view>
</template>
<script>
import * as CaptchaApi from "@/api/captcha";
import * as SmsApi from "@/api/sms";
import * as EmailApi from "@/api/email";
import { isEmpty } from "@/utils/verify.js";

export default {
  data() {
    return {
      loginType: 'email', // 默认使用邮箱登录
      email: '',
      password: '',
      emailCode: '',
      emailCodeCountdown: 0,
      showCaptcha: false,
      smsCodeCountdown: 0,
      title: "智考导师 Pro",
      subTitle: "专业自考备考指导，一路相伴，助您成功",
      smsCode: null,
      // 图形验证码信息
      captcha: null,
      // 登录账号
      phoneNumber: "",
      username: "admin",
      // 密码
      uuid: "",
      // 图形验证码
      captchaCode: "",
    };
  },
  created() {
    // 获取图形验证码
    // this.getCaptcha();
  },
  methods: {
    // 发送邮箱验证码
    sendEmailCode() {
      // 检查倒计时是否激活
      if (this.emailCodeCountdown > 0) {
        return;
      }

      // 验证邮箱
      if (isEmpty(this.email)) {
        uni.$u.toast("请输入邮箱");
        return;
      }

      // 发送邮箱验证码
      EmailApi.sendCode({
        email: this.email
      }).then((result) => {
        if (result.code == 200) {
          uni.$u.toast("验证码发送成功");
          // 开始倒计时
          this.emailCodeCountdown = 60;
          const countdownTimer = setInterval(() => {
            this.emailCodeCountdown--;
            if (this.emailCodeCountdown <= 0) {
              clearInterval(countdownTimer);
            }
          }, 1000);
        }
      });
    },
    // 发送验证码
    sendSmsCode() {
      // Check if countdown is active
      if (this.smsCodeCountdown > 0) {
        return;
      }

      // Show maintenance message and suggest email login
      uni.$u.toast("手机验证码功能维护中，请使用邮箱登录");
      this.loginType = 'email'; // Auto-switch to email login
      return;

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
      
      if (this.loginType === 'email') {
        // 验证邮箱登录表单
        if (isEmpty(app.email)) {
          uni.$u.toast("请输入邮箱");
          return false;
        }
        if (isEmpty(app.emailCode)) {
          uni.$u.toast("请输入验证码");
          return false;
        }
      } else {
        // 验证手机号登录表单
        if (isEmpty(app.phoneNumber)) {
          uni.$u.toast("请输入手机号码");
          return false;
        }
        if (isEmpty(app.smsCode)) {
          uni.$u.toast("请输入验证码");
          return false;
        }
      }
      
      return true;
    },
    // 确认登录
    login() {
      const app = this;
      let valid = app.validItem();
      if (valid) {
        app.isLoading = true;
        
        if (this.loginType === 'email') {
          // 使用邮箱验证码登录
          const loginData = { 
            email: app.email, 
            code: app.emailCode 
          };
          
          app.$store
            .dispatch("LoginByEmail", loginData)
            .then((result) => {
              uni.switchTab({
                url: "/pages/index/index",
                fail(err) {
                  console.log(err);
                },
              });
            })
            .catch((err) => {
              console.log(err);
            })
            .finally(() => (app.isLoading = false));
        } else {
          // 手机号登录继续使用原来的方式
          const loginData = { 
            tel: app.phoneNumber, 
            code: app.smsCode, 
            loginType: 'phone' 
          };
            
          app.$store
            .dispatch("Login", loginData)
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
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import "index.scss";

.login-type-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  position: relative;
  z-index: 2;
}

.toggle-item {
  padding: 8px 20px;
  margin: 0 10px;
  font-size: 14px;
  border-bottom: 2px solid transparent;
  color: #666;
}

.toggle-item.active {
  color: #ff7e45;
  border-bottom: 2px solid #ff7e45;
  font-weight: 500;
}

/* Ensure the login container doesn't push content down too much */
.t-login {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.login-background {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.t-b, .t-b2 {
  position: relative;
  z-index: 1;
}

/* Adjust form to not push content down too far */
.cl {
  position: relative;
  z-index: 1;
  padding-bottom: 120px; /* Add padding to ensure space for the footer */
}
</style>
