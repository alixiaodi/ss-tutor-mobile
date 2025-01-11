import request from '@/config/request.js';

export const getCollectGroupList = () => request.get('/collectGroup/list', null, {})

export const addCollectGroup = (data) => request.post('/collectGroup/add', data, { header: { "Content-Type": "application/x-www-form-urlencoded" } })
