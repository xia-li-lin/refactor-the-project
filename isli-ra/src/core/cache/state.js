class State {
  constructor () {
    this.data = {}
    this.prefix = 'prefix'
  }

  set (key, value, sessionStorage = true, localStorage = false) {
    const valKey = this.prefix + key
    this.data[valKey] = value
    if (typeof value === 'object' && value) {
      value = JSON.stringify(value)
    }
    if (sessionStorage) {
      if (!value) {
        window.sessionStorage.removeItem(valKey)
      } else {
        window.sessionStorage.setItem(valKey, value)
      }
    }
    if (localStorage) {
      if (!value) {
        window.localStorage.removeItem(valKey)
      } else {
        window.localStorage.setItem(valKey, value)
      }
    }
  }

  get (key) {
    key = this.prefix + key
    if (key in this.data) {
      return this.data[key]
    }
    let value = window.sessionStorage.getItem(key)
    if (!value) {
      value = window.localStorage.getItem(key)
    }
    if (value && value.startsWith('{')) {
      try {
        value = JSON.parse(value)
      } catch (e) {
        console.log(e)
        return null
      }
    }
    return value
  }

  clear (key) {
    if (!key) {
      window.sessionStorage.clear()
      window.localStorage.clear()
      this.state = {}
      return null
    }
    const valKey = this.prefix + key
    if (valKey in this.data) {
      delete this.data[valKey]
      window.sessionStorage.removeItem(valKey)
      window.localStorage.removeItem(valKey)
    } else {
      for (let name in this.data) {
        if (name.startsWith(valKey)) {
          this.clear(valKey)
        }
      }
    }
  }
}

const state = new State()
export default state
