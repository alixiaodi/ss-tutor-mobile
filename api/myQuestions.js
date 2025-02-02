// 我的题库API
import request from '@/config/request.js';

// 生成导入链接
export const generateImportLink = (subjectCode) => request.get('/generateImportQuestionLink?subjectCode=' + subjectCode)  

// 我的题库列表
export const getMyQuestionList = (subjectCode) => request.get('/getMyQuestionsList/' + subjectCode)
