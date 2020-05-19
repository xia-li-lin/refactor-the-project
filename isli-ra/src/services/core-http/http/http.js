import { HttpHook, HTTP_HOOKS } from '../http-hooks'
import { HttpResponse } from './http-response'
export class RequestModel {
  constructor (url, method, urlParams, queryParams, body, headers, beginTime) {
    this.url = url
    this.method = method
    this.urlParams = urlParams || {}
    this.queryParams = queryParams || {}
    this.body = body || {}
    this.headers = headers || {}
    this.beginTime = beginTime || new Date().getTime()
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
    this.httpHook = HttpHook
    this.headerServ = headerServ
    this.context = ''
    this.headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache,no-store' }
  }

  delete (url, urlParam, queryParams) {
    const request = new RequestModel(this.buildURL(url, urlParam), 'delete', urlParam, queryParams, {}, Date.now())
    return new HttpResponse(this, request, this.self)
  }

  // get请求
  get (url, urlParam, queryParams) {
    console.log('this:' + this, this.self)
    const request = new RequestModel(this.buildURL(url, urlParam), 'get', urlParam, queryParams, {}, Date.now())
    return new HttpResponse(this, request, this.self)
  }

  // patch 请求
  patch (url, urlParam, queryParams, body) {
    const request = new RequestModel(this.buildURL(url, urlParam), 'patch', urlParam, queryParams, body, Date.now())
    return new HttpResponse(this, request, this.self)
  }

  // post请求
  post (url, urlParam, queryParams, body, headers) {
    const request = new RequestModel(
      this.buildURL(url, urlParam),
      'post',
      urlParam,
      queryParams,
      body,
      Date.now(),
      headers
    )
    return new HttpResponse(this, request, this.self)
  }

  // put请求
  put (url, urlParam, queryParams, body, headers) {
    const request = new RequestModel(
      this.buildURL(url, urlParam),
      'put',
      urlParam,
      queryParams,
      body,
      Date.now(),
      headers
    )
    return new HttpResponse(this, request, this.self)
  }

  // option请求
  option (url, urlParam, queryParams) {
    const request = new RequestModel(this.buildURL(url, urlParam), 'option', urlParam, queryParams, {}, Date.now())
    return new HttpResponse(this, request, this.self)
  }

  buildURL (url, urlParam) {
    if (!url) {
      throw Error('url empty')
    }
    let newUrl = url.replace(/\/:([a-zA-Z\-_]+)/g, function (match, p1) {
      console.log(urlParam)
      console.log(match)
      console.log(p1)
      if (p1 in urlParam) {
        return '/' + encodeURIComponent(urlParam[p1]) || ''
      }
      throw Error(p1 + '  not match')
    })
    console.log(newUrl)
    newUrl = newUrl.replace(/\/{([a-zA-Z\-_]+)}/g, function (match, p1) {
      if (p1 in urlParam) {
        return '/' + encodeURIComponent(urlParam[p1]) || ''
      }
      throw Error(p1 + '  not match')
    })
    console.log(newUrl, this.context)

    return this.context + newUrl
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

  getHeader (requstModel) {
    const headers = this.headerServ.getHeader()
    if (headers instanceof Promise) {
      return headers.then((headerData) => {
        return Object.assign({}, this.headers, requstModel.headers || {}, headerData || {})
      })
    } else {
      return Promise.resolve(Object.assign({}, this.headers, requstModel.headers || {}, headers || {}))
    }
  }

  makeHttpRequest (requstModel, httpResponse) {
    if (this.httpHook) {
      this.httpHook.runHttpHook(HTTP_HOOKS.HTTP_BEGIN, requstModel)
    }
    if (httpResponse.handleHttpBegin()) {
      httpResponse.handleHttpEnd()
      if (this.httpHook) {
        this.httpHook.runHttpHook(HTTP_HOOKS.HTTP_END, requstModel)
      }
      return false
    }
    this.getHeader(requstModel).then((headers) => {
      this.http({
        url: requstModel.url,
        method: requstModel.method,
        headers: headers,
        body: requstModel.body,
        params: requstModel.queryParams
      }).then(
        (response) => {
          this.headerServ.setHeader(response.headers)
          const resp = this.convertHttpResponse(response.body)
          resp.castTime = resp.endTime - requstModel.beginTime
          resp.success = this.checkHttpResponseSuccess(resp)
          if (resp.success) {
            if (this.httpHook) {
              this.httpHook.runHttpHook(HTTP_HOOKS.HTTP_SUCCESS, requstModel, resp)
            }
            httpResponse.handlesuccess(resp)
          } else {
            if (this.httpHook) {
              this.httpHook.runHttpHook(HTTP_HOOKS.HTTP_FALIES, requstModel, resp)
            }
            httpResponse.handleFailed(resp)
          }
          httpResponse.handleHttpEnd()
          if (this.httpHook) {
            this.httpHook.runHttpHook(HTTP_HOOKS.HTTP_END, requstModel, resp)
          }
        },
        (error) => {
          if (this.httpHook) {
            this.httpHook.runHttpHook(HTTP_HOOKS.HTTP_ERROR, requstModel, error.status)
          }
          httpResponse.handleError(error)
          httpResponse.handleHttpEnd()
        }
      )
    })
    return true
  }
}
