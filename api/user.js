import request from '@/config/request.js';

// 获取用户信息
export const getInfo = () => request.get('/user/getInfo')

//  签到
export const sign = () => request.post('/user/sign')


// 退出登录
export const logout = () => request.post('/user/logout')

 