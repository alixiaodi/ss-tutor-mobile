import request from '@/config/request.js';

// 获取验证码
export const sendCode = (params) => request.post('/sms', params, {
    custom: { auth: false, loading: true },
    header: { "Content-Type": "application/x-www-form-urlencoded" }
})