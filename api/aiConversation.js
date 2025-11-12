import request from '@/config/request.js';

export const listConversations = (params) =>
  request.get('/ai/conversation/list', params, {});

export const getConversationDetail = (conversationId) =>
  request.get(`/ai/conversation/${conversationId}`, null, {});

export const createConversation = (data) =>
  request.post('/ai/conversation', data, {});

export const updateConversation = (conversationId, data) =>
  request.put(`/ai/conversation/${conversationId}`, data, {});

export const deleteConversation = (conversationId) =>
  request.delete(`/ai/conversation/${conversationId}`, null, {});
