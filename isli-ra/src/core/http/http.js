import { HTTP_HOOKS, HttpHook } from './http-hooks'
import { HttpResponse } from './http-response'

export class RequestModel {
  constructor (url, method, urlParams, queryParams, body, beginTime) {
    this.url = url
    this.method = method
    this.urlParams = urlParams || {}
    this.queryParams = queryParams || {}
    this.body = body || {}
    this.beginTime = beginTime || new Date().getTime()
    this.headers = this.headers || {}
  }
}

export class ResponseModel {
  constructor (code, msg, data, response, endTime, castTime, success, isCached) {
    this.code = code
    this.msg = msg
    this.data = data
    this.response = response
    this.endTime = endTime || new Date().getTime()
    this.castTime = castTime
    this.success = success || false
    this.isCached = isCached || false
  }
}

export class Http {
  constructor (http, self, headerServ) {
    this.http = http
    this.self = self
    this.headerServ = headerServ
    this.httpHook = HttpHook
    this.context = ''
    this.headers = {'Content-Type': 'application/json; chartset=utf-8', 'Cache-Control': 'no-cache,no-store'}
  }

  get (url, urlParams, queryParams) {
    const request = new RequestModel(this.buildURL(url, urlParams), 'get', urlParams, queryParams, {}, Date.now())
    return new HttpResponse(this, request, this.self)
  }

  post (url, urlParams, queryParams, body, headers) {
    const request = new RequestModel(this.buildURL(url, urlParams), 'post', urlParams, queryParams, body, Date.now(), headers)
    return new HttpResponse(this, request, this.self)
  }

  delete (url, urlParams, queryParams) {
    const request = new RequestModel(this.buildURL(url, urlParams), 'delete', urlParams, queryParams, {}, Date.now())
    return new HttpResponse(this, request, this.self)
  }

  patch (url, urlParams, queryParams, body) {
    const request = new RequestModel(this.buildURL(url, urlParams), 'patch', urlParams, queryParams, body, Date.now())
    return new HttpResponse(this, request, this.self)
  }

  put (url, urlParams, queryParams, body, headers) {
    const request = new RequestModel(this.buildURL(url, urlParams), 'put', urlParams, queryParams, body, Date.now(), headers)
    return new HttpResponse(this, request, this.self)
  }

  options (url, urlParams, queryParams) {
    const request = new RequestModel(this.buildURL(url, urlParams), 'options', urlParams, queryParams, {}, Date.now())
    return new HttpResponse(this, request, this.self)
  }

  buildURL (url, urlParams) {
    if (!url) {
      throw Error('url empty')
    }
    let newUrl = url.replace(/\/:([a-zA-Z\-_]+)/g, function (match, p1) {
      if (p1 in urlParams) {
        return '/' + encodeURIComponent(urlParams[p1]) || ''
      }
      throw Error(p1 + ' not match')
    })

    newUrl = newUrl.replace(/\/{([a-zA-Z\-_]+)}/g, function (match, p1) {
      if (p1 in urlParams) {
        return '/' + encodeURIComponent(urlParams[p1]) || ''
      }
      throw Error(p1 + '  not match')
    })
    return this.context + newUrl
  }

  getHeader (requestModel) {
    const headers = this.headerServ.getHeader()
    if (headers instanceof Promise) {
      return headers.then(data => {
        return Object.assign({}, this.headers, requestModel.headers || {}, data || {})
      })
    } else {
      return Promise.resolve(Object.assign({}, this.headers, requestModel.headers || {}, headers || {}))
    }
  }

  makeHttpRequest (requestModel, httpResponse) {
    if (this.httpHook) {
      this.httpHook.runHttpHook(HTTP_HOOKS.HTTP_BEGIN, requestModel)
    }
    if (httpResponse.handleHttpBegin) {
      httpResponse.handleHttpEnd()
      if (this.httpHook) {
        this.httpHook.runHttpHook(HTTP_HOOKS.HTTP_END, requestModel)
      }
      return false
    }
    this.getHeader(requestModel).then(headers => {
      this.http({
        url: requestModel.url,
        method: requestModel.method,
        headers: requestModel.headers,
        body: requestModel.body,
        params: requestModel.queryParams
      }).then(response => {
        this.headerServ.setHeader(response.headers)
        const resp = this.convertHttpResponse(response)
        resp.castTime = resp.endTime - resp.beginTime
        resp.success = this.checkHttpResponseSuccess(resp)
        if (resp.success) {
          if (this.httpHook) {
            this.httpHook.runHttpHook(HTTP_HOOKS.HTTP_SUCCESS, requestModel, resp)
          }
          httpResponse.handleSuccess(resp)
        } else {
          if (this.httpHook) {
            this.httpHook.runHttpHook(HTTP_HOOKS.HTTP_FAILD, requestModel, resp)
          }
          httpResponse.httpFailed(resp)
        }
        httpResponse.handleHttpEnd()
        if (this.httpHook) {
          this.httpHook.runHttpHook(HTTP_HOOKS.HTTP_END, requestModel, resp)
        }
      },
      error => {
        if (this.httpHook) {
          this.httpHook.runHttpHook(HTTP_HOOKS.HTTP_ERROR, requestModel, error.status)
        }
        httpResponse.handleError(error)
        httpResponse.handleHttpEnd()
      })
    })
    return true
  }

  convertHttpResponse (response) {
    return new ResponseModel(
      response.resultCode,
      response.msg || response.resultMsg,
      response.data === undefined ? {} : response.data
    )
  }

  checkHttpResponseSuccess (response) {
    return response.code === '00000000'
  }
}
