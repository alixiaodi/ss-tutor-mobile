import request from '@/config/request.js';

export const add = (data) => request.post('/answerQuestions/add', data)

export const submit = (id, data) => request.post(`/answerQuestions/submit/${id}`, data)


export const uploadAnswer = (data) => request.post('/answerQuestions/uploadAnswer', data, { custom: { loading: false } })

// 获取答题历史
export const getHistory = (id) => request.get(`/answerQuestions/answerList/${id}`)

// 清除答题记录
export const clearAnswer = (id) => request.delete(`/answerQuestions/deleteAnswer/${id}`)

// 获取记忆方法的示例数据
export function getMemoryTip(questionId) {
  // 模拟接口调用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: 'success',
        data: {
          content: formatMemoryTip({
            type: 'keyword',
            keyword: [
              '偏差',
              '规约',
              '系统执行',
              '失效'
            ],
            memory: [
              '偏差：表示实际表现与预期标准不一致',
              '规约：指的是系统的规范或标准。',
              '系统执行：实际运行过程中的表现。',
              '失效：表示功能不再正常工作。'
            ],
            associate: [
              '联想：想象一个软件系统在运行过程中，由于某种原因导致其行为偏离了预定的规范，这种偏差最终导致系统无法正常工作（失效）。',
              '例子：比如一个银行系统的转账功能，如果转账金额计算出现偏差，最终可能导致资金无法正确转入目标账户，从而导致系统失效。'
            ],
            pithyFormula: [
              '口诀：偏差导致失效，系统出问题。',
              '解释：当系统的实际表现与预定规范有偏差时，最终会导致系统失效。'
            ],
            logicalReasoning: [
              '错误：通常指代码中的语法或逻辑错误。',
              '失效：指系统功能不再正常工作。',
              '故障：指系统出现异常但不一定完全停止工作。',
              '误差：通常指数值上的微小差异。',
              '偏差：表示实际表现与预期标准不一致，最终可能导致系统失效。'
            ]
          })
        }
      });
    }, 500);
  });
}

// 格式化记忆方法内容
function formatMemoryTip(data) {
  let content = '';
  
  // 关键词部分
  if (data.keyword && data.memory) {
    content += '<div style="margin-bottom: 20px;">';
    content += '<h4 style="color: #8B4513; margin-bottom: 10px;">关键词记忆</h4>';
    content += '<div style="background: rgba(255,215,0,0.1); padding: 10px; border-radius: 8px;">';
    data.memory.forEach((item, index) => {
      content += `<p style="margin: 5px 0; color: #666;">${item}</p>`;
    });
    content += '</div></div>';
  }

  // 联想记忆部分
  if (data.associate) {
    content += '<div style="margin-bottom: 20px;">';
    content += '<h4 style="color: #8B4513; margin-bottom: 10px;">联想记忆</h4>';
    content += '<div style="background: rgba(255,215,0,0.1); padding: 10px; border-radius: 8px;">';
    data.associate.forEach(item => {
      content += `<p style="margin: 5px 0; color: #666;">${item}</p>`;
    });
    content += '</div></div>';
  }

  // 口诀部分
  if (data.pithyFormula) {
    content += '<div style="margin-bottom: 20px;">';
    content += '<h4 style="color: #8B4513; margin-bottom: 10px;">记忆口诀</h4>';
    content += '<div style="background: rgba(255,215,0,0.1); padding: 10px; border-radius: 8px;">';
    data.pithyFormula.forEach(item => {
      content += `<p style="margin: 5px 0; color: #666;">${item}</p>`;
    });
    content += '</div></div>';
  }

  // 逻辑推理部分
  if (data.logicalReasoning) {
    content += '<div style="margin-bottom: 20px;">';
    content += '<h4 style="color: #8B4513; margin-bottom: 10px;">逻辑推理</h4>';
    content += '<div style="background: rgba(255,215,0,0.1); padding: 10px; border-radius: 8px;">';
    data.logicalReasoning.forEach(item => {
      content += `<p style="margin: 5px 0; color: #666;">${item}</p>`;
    });
    content += '</div></div>';
  }

  return content;
}
