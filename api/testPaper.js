import request from '@/config/request.js';

// 获取用户信息
export const getYearPaper = (subjectId) => request.get(`/testpaper/yearPaper/${subjectId}`, null);

export const getPaperDetail = (paperId) => request.get(`/testpaper/${paperId}`, null);

export const getAISimulatePaper = (subjectId) => request.get(`/testpaper/aiSimulate/${subjectId}`, null);
