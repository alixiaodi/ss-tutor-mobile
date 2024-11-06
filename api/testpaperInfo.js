import request from '@/config/request.js';

// 获取用户信息
export const getQuestionsByPaperId = (paperId) => request.get(`/testpaperInfo/getQuestionsByPaperId/${paperId}`, null);
