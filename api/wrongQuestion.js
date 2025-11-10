import request from '@/config/request.js';

// 获取错题列表
export const getWrongQuestionList = (params) => request.get('/wrongQuestion/list', params);
