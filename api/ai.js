import request from '@/config/request.js';

// 获取验证码
export const judge = (id, userAnswer) => request.post(`/ai/judge/${id}?userAnswer=${userAnswer}`, null)