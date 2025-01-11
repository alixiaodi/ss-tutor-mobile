import request from '@/config/request.js';


export const addCollectInfo = (data) => request.post('/collectInfo/add', data, {})
export const listCollectInfo = (groupId) => request.get('/collectInfo/list/' + groupId, null, {})

export const deleteCollectInfo = (id) => request.delete('/collectInfo/delete/' + id, null, {})
