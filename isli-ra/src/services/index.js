import Vue from 'vue'
import plugin, { serviceManager } from './core-http'

import './service/common'
import * as services from './service'
for (let name in services) {
  serviceManager.registerService(name, services[name])
}
Vue.use(plugin)
