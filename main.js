import App from './App'
import Vue from 'vue'
import uView from '@/uni_modules/uview-ui'
import store from '@/store'
import Cookies from 'js-cookie'

Vue.use(uView)
Vue.config.productionTip = false

// 添加路由检查方法
const checkLoginStatus = () => {
  let token = ''
  // #ifdef H5
  token = Cookies.get('ss-tutor-token')
  // #endif
  
  // #ifdef MP-WEIXIN
  token = uni.getStorageSync('ss-tutor-token')
  // #endif
  
  // #ifdef APP-PLUS
  token = uni.getStorageSync('ss-tutor-token')
  // #endif
  
  if (token) {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage) {
      const currentPath = '/' + currentPage.route
      if (currentPath === '/pages/login/index') {
        uni.reLaunch({
          url: '/pages/index/index'
        })
      }
    } else {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    }
  }
}

App.mpType = 'app'

const app = new Vue({
  store,
  ...App
})

// 引入请求封装，将app参数传递到配置中
require('@/config/http.interceptor.js')(app)

// 添加页面显示监听
uni.addInterceptor('navigateTo', {
  invoke(e) {
    checkLoginStatus()
    return e
  }
})

// #ifdef MP-WEIXIN
wx.onAppShow(() => {
  checkLoginStatus()
})
// #endif

// 监听应用初始化完成
Vue.prototype.$onLaunched = new Promise(resolve => {
  Vue.prototype.$isResolve = resolve
})

// 在应用启动时也检查一次登录状态
setTimeout(() => {
  checkLoginStatus()
}, 100)

app.$mount()