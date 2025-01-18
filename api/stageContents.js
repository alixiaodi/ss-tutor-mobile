import request from '@/config/request.js';

// 树形列表
export const getStageContents = (subjectCode) => request.get(`/fStageContents/tree/${subjectCode}`);

// 获取最后一次答题记录
export const getLastAnswerRecord = (paperId) => request.get(`/fStageContents/lastAnswer/${paperId}`);
