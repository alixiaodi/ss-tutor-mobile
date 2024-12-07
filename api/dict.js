import request from '@/config/request.js';

export const getDictList = (key) => request.get(`/common/getDictList/${key}`, null, { custom: { auth: false } })

