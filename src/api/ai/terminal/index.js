import request from '@/utils/request'

export function addObj(obj) {
  return request({
    url: '/api/ai/terminal',
    method: 'post',
    data: obj
  })
}

export function getObj(id) {
  return request({
    url: '/api/ai/terminal/' + id,
    method: 'get'
  })
}

export function delObj(id) {
  return request({
    url: '/api/ai/terminal/' + id,
    method: 'delete'
  })
}

export function putObj(id, obj) {
  return request({
    url: '/api/ai/terminal/' + id,
    method: 'put',
    data: obj
  })
}
