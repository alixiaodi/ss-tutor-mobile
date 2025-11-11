import request from '@/config/request.js';

// 获取错题列表
export const getWrongQuestionList = (params) => request.get('/wrongQuestion/list', params);

// 获取错题详情
export const getWrongQuestionDetail = (id) =>
  request.get(`/wrongQuestion/detail/${id}`);
