import request from '@/config/request.js';

// 获取验证码
export const judge = (id, userAnswer, answerId) => request.post(`/ai/judge/${id}?userAnswer=${userAnswer}&answerId=${answerId}`, null)
export const getMemory = (id) => request.get(`/ai/getMemory/${id}`, null)