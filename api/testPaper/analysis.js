import request from '@/config/request.js';

export const getPaperAnalysis = (subjectCode) => request.get('/testPaperAnalysis/list/' + subjectCode, null)
export const getPaperAnalysisDetail = (id) => request.get('/testPaperAnalysis/info/' + id, null)

