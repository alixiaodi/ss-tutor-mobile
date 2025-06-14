import request from '@/utils/request'

// 获取错题列表
export function getWrongQuestionList(params) {
  return request({
    url: '/question/wrong/list',
    method: 'get',
    params
  })
}

// 添加错题
export function addWrongQuestion(data) {
  return request({
    url: '/question/wrong',
    method: 'post',
    data
  })
}

// 从错题本中移除
export function removeWrongQuestion(id) {
  return request({
    url: `/question/wrong/${id}`,
    method: 'delete'
  })
}

// 判断题目是否在错题本中
export function checkIsWrong(id) {
  return request({
    url: `/question/wrong/check/${id}`,
    method: 'get'
  })
}

// 获取错题统计信息
export function getWrongStats() {
  return request({
    url: '/question/wrong/stats',
    method: 'get'
  })
} 