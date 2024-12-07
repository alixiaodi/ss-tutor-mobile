import request from '@/config/request.js';

// 获取用户信息
export const list = (parentId) => request.get(`/subject/list?parentId=${parentId === undefined ? 0 : parentId}`);
