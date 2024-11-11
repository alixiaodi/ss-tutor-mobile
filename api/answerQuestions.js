import request from '@/config/request.js';

export const add = (data) => request.post('/answerQuestions/add', data)

export const submit = (data) => request.post('/answerQuestions/submit', data)


export const uploadAnswer = (data) => request.post('/answerQuestions/uploadAnswer', data, { custom: { loading: false } })

