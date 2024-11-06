import request from '@/config/request.js';

// 获取用户信息
export const getYearPaper = (subjectId) => request.get(`/testpaper/yearPaper/${subjectId}`, null);
