import request from '@/config/request.js';

export const getPaperAnalysis = (subjectCode) => request.get('/testPaperAnalysis/list/' + subjectCode, null)
export const getPaperAnalysisDetail = (id) => request.get('/testPaperAnalysis/info/' + id, null)

// 考点分析
export const getExamPointAnalysis = (subjectCode) => request.get('/testPaperAnalysis/analysis/' + subjectCode, null)

// 获取考点题目
export const getExamPointQuestions = (examCenter) => request.get('/testPaperAnalysis/examCenter/topic?examCenter=' + examCenter)

// 最后一次答题记录
export const getLastAnswerRecord = (queryKey) => request.get('/testPaperAnalysis/lastAnswer?queryKey=' + queryKey)
