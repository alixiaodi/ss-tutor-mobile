import request from '@/config/request.js';
const { environment } = require('@/config/environment.js');

// 获取验证码
export const judge = (id, userAnswer, answerId) => request.post(`/ai/judge/${id}?userAnswer=${userAnswer}&answerId=${answerId}`, null)

export const getMemory = (id) => request.get(`/ai/getMemory/${id}`, null, { timeout: 180000 })
// 获取可生成模拟试卷的次数
export const getMockExamCount = () => request.get(`/ai/getMockExamCount`, null)

// 获取可生成的次数
export const getGenerateCount = () => request.get(`/ai/getGeneratePaperCount`, null)

// 生成模拟试卷
export const generatePaper = (sCode) => request.post(`/ai/generatePaper/${sCode}`, null)

// AI chat
export const chat = (message, onProgress) => {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      // 根据环境判断使用的baseURL
      const baseURL = process.env.NODE_ENV === 'production' 
        ? environment.baseURL 
        : '';
      xhr.open('POST', `${baseURL}/ai/chat?message=${message}`, true);
      xhr.setRequestHeader('Content-Type', 'text/event-stream');
      xhr.send(null);

      let fullResponse = '';
      let lastProcessedIndex = 0;  // 添加一个变量来追踪上次处理的位置
      
      xhr.onprogress = function(event) {
        const responseText = xhr.responseText;
        // 从上次处理的位置开始截取新数据
        const newData = responseText.substring(lastProcessedIndex);
        
        if (newData) {
          const chunks = newData.split('data:');
          chunks.forEach(chunk => {
            if (chunk.trim()) {
              const newStr = JSON.parse(chunk.trim()).data
              fullResponse += newStr;
              // 调用回调函数，实时更新UI
              onProgress && onProgress(newStr);
            }
          });
          // 更新已处理位置
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