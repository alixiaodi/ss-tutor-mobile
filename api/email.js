import request from '@/config/request.js';

// 发送邮箱验证码
export const sendCode = (params) => request.post('/email/code/send', params, {
    custom: { auth: false, loading: true },
    header: { "Content-Type": "application/x-www-form-urlencoded" }
}); 