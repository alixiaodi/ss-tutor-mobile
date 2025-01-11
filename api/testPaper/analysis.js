import request from '@/config/request.js';

export const getPaperAnalysis = (subjectCode) => request.get('/testPaperAnalysis/list/' + subjectCode, null)
export const getPaperAnalysisDetail = (id) => request.get('/testPaperAnalysis/info/' + id, null)

// 考点分析
export const getExamPointAnalysis = (subjectCode) => request.get('/testPaperAnalysis/analysis/' + subjectCode, null)
