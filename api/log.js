import request from '@/config/request.js';

// 获取验证码
export const saveLog = (content) => request.post('/optLog', { content }, {
    custom: { loading: false },
    header: { "Content-Type": "application/x-www-form-urlencoded" }
})