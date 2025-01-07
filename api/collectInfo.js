import request from '@/config/request.js';


export const addCollectInfo = (data) => request.post('/collectInfo/add', data, {})
