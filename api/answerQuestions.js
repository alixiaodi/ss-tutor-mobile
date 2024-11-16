import request from '@/config/request.js';

export const add = (data) => request.post('/answerQuestions/add', data)

export const submit = (id, data) => request.post(`/answerQuestions/submit/${id}`, data)


export const uploadAnswer = (data) => request.post('/answerQuestions/uploadAnswer', data, { custom: { loading: false } })

// 获取答题历史
export const getHistory = (id) => request.get(`/answerQuestions/answerList/${id}`)

