export const HTTP_HOOKS = {
  ADD_HEADER: 'add_header',
  HTTP_BEGIN: 'http_begin',
  HTTP_SUCCESS: 'http_sucess',
  HTTP_FALID: 'http_failed',
  HTTP_ERROR: 'http_error',
  HTTP_END: 'http_end'
}

export function HttpHook (options) {
  options = options || {}
  for (let name in options) {
    if (options[name] && options[name] instanceof Array) {
      options[name].forEach((func) => {
        HttpHook.registerHook(name, func)
      })
    } else if (options[name]) {
      HttpHook.registerHook(name, options[name])
    }
  }
}

HttpHook.registerHook = function (hookType, hookFunc) {
  if (hookType in HttpHook.hooks) {
    if (HttpHook.hooks[hookType].indexOf(hookFunc) !== -1) {
      console.log('hooks has already registered with func: ' + hookFunc.toString())
      return null
    }
    HttpHook.hooks[hookType].push(hookFunc)
  } else {
    HttpHook.hooks[hookType] = [ hookFunc ]
  }
}

HttpHook.unregisterHttpHook = function (hookType, hookFunc) {
  if (!(hookType in this.hooks)) {
    console.log('hooks never been registerd: ' + hookType)
    return null
  }
  if (!hookFunc) {
    this.hooks[hookType] = []
  } else {
    const index = this.hooks[hookType].indexOf(hookFunc)
    index === -1
      ? console.log('hook func never registered: ' + hookFunc.toString)
      : this.hooks[hookType].splice(index, 1)
  }
}

HttpHook.runHttpHook = function (hookType, ...args) {
  if (hookType in HttpHook.hooks) {
    let result = false
    const length = args.length
    for (const func of HttpHook.hooks[hookType]) {
      args[length] = result
      if ((result = func.call(this, args) === true)) {
        return
      }
    }
  }
}

HttpHook.hooks = {}
