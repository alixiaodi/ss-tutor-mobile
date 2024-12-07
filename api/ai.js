import request from '@/config/request.js';

// 获取验证码
export const judge = (id, userAnswer, answerId) => request.post(`/ai/judge/${id}?userAnswer=${userAnswer}&answerId=${answerId}`, null)

export const getMemory = (id) => request.get(`/ai/getMemory/${id}`, null, { timeout: 180000 })
// 获取可生成模拟试卷的次数
export const getMockExamCount = () => request.get(`/ai/getMockExamCount`, null)

// 获取可生成的次数
export const getGenerateCount = () => request.get(`/ai/getGeneratePaperCount`, null)

// 生成模拟试卷
export const generatePaper = (sCode) => request.post(`/ai/generatePaper/${sCode}`, null)

// AI chat
export const chat = (message) => request.post(`/ai/chat?message=${message}`, null , { timeout: 180000 })