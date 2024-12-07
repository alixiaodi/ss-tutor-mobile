
import request from '@/config/request.js';

// 创建支付订单
export const createPayOrder = (data) => request.post(`/order/create`, data);
