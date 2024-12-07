import request from '@/config/request.js';

// 列表
export const  vipPackageList = () => request.get('/vipPackage')