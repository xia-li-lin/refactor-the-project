// 此类是为了方便http调用, 从而对Promise增加了一层封装
export class HttpResponse {
  response;
  beforFunc = [];
  afterFunc = [];
  successFunc = [];
  errorHander = [];
  failHander = [];
  translateHandler;

  delayPromise;
  delayFunc;
  executePromiseResolve;
  executePromiseReject;
  executePromise;
  noReq = false; // 不发送http请求标志

  constructor (http, request, componetSelf, cacheRes) {
    this.http = http
    this.request = request
    this.cacheRes = cacheRes
    this.componetSelf = componetSelf
    const self = this
    this.executePromise = new Promise((resolve, reject) => {
      self.executePromiseResolve = resolve
      self.executePromiseReject = reject
    })
    this.response = cacheRes
    Promise.resolve(null).then(() => {
      if (self.noReq) {
        return
      }
      if (self.request && !self.response) {
        self.requestHttp()
      } else {
        self.makeCacheResponse()
      }
    })
    this.executePromise.then((result) => {
      console.log('http execute over: ', result, request)
      return result
    })
  }

  requestHttp () {
    if (this.delayPromise) {
      const self = this
      this.delayPromise.then((data) => {
        if (self.delayFunc) {
          self.delayFunc(data, this.request)
        }
        self.http.makeHttpRequest(this.request, this)
      })
    } else {
      this.http.makeHttpRequest(this.request, this)
    }
  }

  makeCacheResponse (cacheRes) {
    if (cacheRes) {
      this.response = cacheRes
    }
    this.handleHttpEnd()
    let result
    for (let i = 0; i < this.successFunc.length; ++i) {
      result = this.successFunc[i](this.response, this.request, result)
      if (result === false) {
        break
      }
    }
    this.executePromiseResolve(result)
    this.handleHttpEnd()
  }

  setNoReq () {
    this.noReq = true
  }

  before (func) {
    if (typeof func !== 'function') {
      return
    }

    if (
      this.beforFunc.findIndex((value) => {
        return value === func
      }) !== -1
    ) {
      return
    }
    this.beforFunc.push(func)
    return this
  }

  after (func) {
    if (typeof func !== 'function') {
      return
    }
    if (
      this.afterFunc.findIndex((value) => {
        return value === func
      }) !== -1
    ) {
      return
    }
    this.afterFunc.push(func)
    return this
  }

  error (func) {
    if (typeof func !== 'function') {
      return
    }
    if (
      this.errorHander.findIndex((value) => {
        return value === func
      }) !== -1
    ) {
      return
    }
    this.errorHander.push(func)
    return this
  }

  delayProcess (func) {
    this.delayFunc = func
    return this
  }

  success (func) {
    if (typeof func !== 'function') {
      return
    }
    if (
      this.successFunc.findIndex((value) => {
        return value === func
      }) !== -1
    ) {
      return
    }
    this.successFunc.push(func)
    console.log(this)
    return this
  }

  failed (func) {
    if (typeof func !== 'function') {
      return
    }
    if (
      this.failHander.findIndex((value) => {
        return value === func
      }) !== -1
    ) {
      return
    }
    this.failHander.push(func)
    return this
  }

  translate (func) {
    if (typeof func !== 'function') {
      return
    }
    this.translateHandler = func
    return this
  }

  delay (delay) {
    this.delayPromise = delay
    return this
  }

  handleHttpBegin () {
    for (let i = 0; i < this.beforFunc.length; ++i) {
      if (this.beforFunc[i].call(this.componetSelf, this.request)) {
        return true
      }
    }
    return false
  }

  handlesuccess (resp) {
    this.response = resp
    if (this.translateHandler) {
      this.response.data = this.translateHandler.call(this.componetSelf, resp.data)
    }
    let result = null
    for (let i = 0; i < this.successFunc.length; ++i) {
      result = this.successFunc[i].call(this.componetSelf, this.response, this.request, result)
      if (result === false) {
        break
      }
    }
    this.executePromiseResolve(result || null)
  }

  handleFailed (resp) {
    this.response = resp
    let result = null
    if (this.failHander.length) {
      this.failHander.forEach((failFunc) => {
        result = failFunc.call(this.componetSelf, this.response, this.request, result)
        if (result === false) {
          return true
        }
      })
      this.executePromiseResolve(result || null)
    } else {
      this.handleError('http result code failed')
    }
  }

  handleError (error) {
    let result = null
    if (this.errorHander.length) {
      this.errorHander.forEach((errorFunc) => {
        result = errorFunc.call(this.componetSelf, this.response, this.request, error, result)
      })
      this.executePromiseResolve(result)
    } else {
      console.error('you should set errorhandler')
      console.error(JSON.stringify(this.request))
      console.error(error || null)
    }
    return this
  }

  handleHttpEnd () {
    this.afterFunc.forEach((afterFunc) => {
      afterFunc.call(this.componetSelf, this.response, this.request)
    })
  }

  toPromise () {
    return this.executePromise
  }

  clone (newRes) {
    this.beforFunc.forEach((func) => {
      newRes.before(func)
    })
    this.successFunc.forEach((func) => {
      newRes.success(func)
    })
    newRes.translate(this.translateHandler)
    this.failHander.forEach((func) => {
      newRes.failed(func)
    })
    this.errorHander.forEach((func) => {
      newRes.error(func)
    })
    this.afterFunc.forEach((func) => {
      newRes.after(func)
    })
    newRes.componetSelf = this.componetSelf
    return newRes
  }
}
