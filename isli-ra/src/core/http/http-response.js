export class HttpResponse {
  response;
  beforeFunc = [];
  successFunc = [];
  afterFunc = [];
  errorHander = [];
  failHander = [];
  translateHandler;

  delayPromise;
  delayFunc;
  executePromise;
  executePromiseResolve;
  executePromiseReject;
  noReq = false;

  constructor (http, request, componentSelf, cacheRes) {
    this.http = http
    this.request = request
    this.componentSelf = componentSelf
    this.cacheRes = cacheRes

    const self = this

    this.executePromise = new Promise((resolve, reject) => {
      this.executePromiseResolve = resolve
      this.executePromiseReject = reject
    })
    this.response = cacheRes
    Promise.resolve(null).then(() => {
      if (self.noReq) return
      if (self.request && !self.response) {
        self.requestHttp()
      } else {
        self.makeCacheResponse()
      }
    })
    this.executePromise.then(result => {
      console.log('http execute over: ', result, request)
      return result
    })
  }

  setNoReq () {
    this.noReq = true
  }

  delay (delay) {
    this.delayPromise = delay
    return this
  }

  delayProcess (func) {
    this.delayFunc = func
    return this
  }

  before (func) {
    if (typeof func !== 'function') {
      return false
    }

    if (
      this.beforeFunc.findIndex(
        value => {
          return value === func
        }) !== -1) { return false }
    this.beforeFunc.push(func)
    return this
  }

  success (func) {
    if (typeof func !== 'function') {
      return false
    }

    if (
      this.successFunc.findIndex(
        value => {
          return value === func
        }
      ) !== -1
    ) { return false }
    this.successFunc.push(func)
    return this
  }

  after (func) {
    if (typeof func !== 'function') {
      return false
    }

    if (this.afterFunc.findIndex(value => { return value === func }) !== -1) {
      return false
    }
    this.afterFunc.push(func)
    return this
  }

  failed (func) {
    if (typeof func !== 'function') {
      return false
    }
    if (this.failHander.findIndex(value => { return value === func }) !== -1) {
      return false
    }
    this.failHander.push(func)
    return this
  }

  error (func) {
    if (typeof func !== 'function') {
      return false
    }
    if (this.errorHander.findIndex(value => { return value === func }) !== -1) {
      return false
    }
    this.errorHander.push(func)
    return this
  }

  translate (func) {
    if (typeof func !== 'function') {
      return false
    }
    this.translateHandler.push(func)
  }

  requestHttp () {
    if (this.delayPromise) {
      const self = this
      this.delayPromise.then(data => {
        if (self.delayFunc) {
          self.delayFunc(data, this.request)
        }
        self.http.makeHttpRequest(this.request, this)
      })
    } else {
      self.http.makeHttpRequest(this.request, this)
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

  handleHttpBegin () {
    for (let i = 0; i < this.beforeFunc.length; ++i) {
      if (this.beforeFunc[i].call(this.componentSelf, this.request)) {
        return true
      }
    }
    return false
  }

  handleSuccess (resp) {
    this.response = resp
    if (this.translateHandler) {
      this.response.data = this.translateHandler.call(this.componentSelf, resp.data)
    }
    let result = null
    for (let i = 0; i < this.successFunc.length; ++i) {
      result = this.successFunc[i].call(this.componentSelf, this.response, this.request, result)
      if (result === false) {
        break
      }
    }
    this.executePromiseResolve(result || null)
  }

  httpFailed (resp) {
    this.response = resp
    let result = null
    if (this.failHander.length) {
      this.failHander.forEach(failHander => {
        result = failHander.call(this.componentSelf, this.response, this.request, result)
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
      this.errorHander.forEach(errorHander => {
        result = errorHander.call(this.componentSelf, this.response, this.request, result, error)
      })
      this.executePromiseResolve(result || null)
    } else {
      console.error('you should set errorhandler')
      console.error(JSON.stringify(this.request))
      console.error(error || null)
    }
    return this
  }

  handleHttpEnd () {
    this.afterFunc.forEach(afterFunc => {
      afterFunc.call(this.componentSelf, this.response, this.request)
    })
  }

  toPromise () {
    return this.executePromise
  }

  clone (newRes) {
    this.beforeFunc.forEach(func => {
      newRes.before(func)
    })
    this.successFunc.forEach(func => {
      newRes.success(func)
    })
    newRes.translate(this.translateHandler)
    this.afterFunc.forEach(func => {
      newRes.before(func)
    })
    this.failHander.forEach(func => {
      newRes.before(func)
    })
    this.errorHander.forEach(func => {
      newRes.before(func)
    })
    newRes.componentSelf = this.componentSelf
    return newRes
  }
}
