import request from '@/config/request.js';

// 获取用户信息
export const addSubject = (data) => request.post(`/subject/${data.examId}`, data.subjectIds);
export const getSubject = () => request.get('/subject');
