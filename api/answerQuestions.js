import request from '@/config/request.js';

export const add = (data) => request.post('/answerQuestions/add', data)

export const submit = (id, data) => request.post(`/answerQuestions/submit/${id}`, data)


export const uploadAnswer = (data) => request.post('/answerQuestions/uploadAnswer', data, { custom: { loading: false } })

