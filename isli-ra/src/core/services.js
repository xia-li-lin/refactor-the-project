import state from './cache/state'
import header from './http/http-header'
import { Http } from './http/http'

export class ServiceManager {
  constructor () {
    this.service = {}
    this.instance = {}
  }
  registerService (name, service) {
    this.service[name] = service
  }
  registerToVue (Vue) {
    for (let name in this.service) {
      let proName = '$' + name.toLowerCase().replace('service', 'Serv')
      const self = this
      Object.defineProperty(Vue.prototype, proName, {
        get () {
          if (!this.$http) {
            throw new Error('you shoule import vue-resource first')
          }
          if (self.instance[name]) {
            self.instance.self = this
            return self.instance[name]
          }
          self.instance[name] = new self.service[name](
            new Http(Vue.http, this, this.$options.headerServ || Vue.headerServ)
          )
          return self.instance[name]
        }
      })
    }
    Object.defineProperty(Vue.prototype, '$state', {
      get () {
        return state
      }
    })
    Object.defineProperty(Vue.prototype, '$httpServ', {
      get () {
        return new Http(Vue.http, this, Vue.headerServ)
      }
    })
  }
}

export class BaseService {
  constructor (http) {
    this.http = http
  }
}

export const serviceManager = new ServiceManager()

function plugin (Vue) {
  if (plugin.installed) {
    return false
  }
  Vue.headerServ = header
  serviceManager.registerToVue(Vue)
}

export default plugin
export * from './http/http-hooks'
export {state}
