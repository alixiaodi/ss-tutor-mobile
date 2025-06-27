import request from '@/config/request.js';
const { environment } = require('@/config/environment.js');

// 获取验证码
export const judge = (id, userAnswer, answerId) => request.post(`/ai/judge/${id}?userAnswer=${userAnswer}&answerId=${answerId}`, null, { timeout: 60000 })

export const getMemory = (id) => request.get(`/ai/getMemory/${id}`, null, { timeout: 180000 })
// 获取可生成模拟试卷的次数
export const getMockExamCount = () => request.get(`/ai/getMockExamCount`, null)

// 获取可生成的次数
export const getGenerateCount = () => request.get(`/ai/getGeneratePaperCount`, null)

// 生成模拟试卷
export const generatePaper = (sCode) => request.post(`/ai/generatePaper/${sCode}`, null)

// AI chat
export const chat = (message, onProgress, params = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      // 根据环境判断使用的baseURL
      const baseURL = process.env.NODE_ENV === 'production' 
        ? environment.baseURL 
        : '';
      
      // 构建URL参数
      const queryParams = new URLSearchParams({
        message: message,
        ...params  // 添加额外的参数
      }).toString();
      
      xhr.open('POST', `${baseURL}/ai/chat?${queryParams}`, true);
      xhr.setRequestHeader('Content-Type', 'text/event-stream');
      xhr.send(null);

      let fullResponse = '';
      let lastProcessedIndex = 0;
      
      xhr.onprogress = function(event) {
        const responseText = xhr.responseText;
        const newData = responseText.substring(lastProcessedIndex);
        
        if (newData) {
          const chunks = newData.split('data:');
          chunks.forEach(chunk => {
            if (chunk.trim()) {
              const newStr = JSON.parse(chunk.trim()).data
              fullResponse += newStr;
              onProgress && onProgress(newStr);
            }
          });
          lastProcessedIndex = responseText.length;
        }
      };

      xhr.onload = function() {
        if (xhr.status === 200) {
          resolve({
            code: 200,
            data: fullResponse
          });
        } else {
          reject({
            code: xhr.status,
            message: '请求失败'
          });
        }
      };

      xhr.onerror = function() {
        reject({
          code: 500,
          message: '连接失败，请重试'
        });
      };

    } catch (error) {
      reject({
        code: 500,
        message: error.message || '请求失败'
      });
    }
  });
}