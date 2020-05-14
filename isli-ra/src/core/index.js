import Vue from 'vue'
import plugin, { serviceManager } from './services'

import * as services from './services'

for (let name in services) {
  serviceManager.registerService(name, services[name])
}

Vue.use(plugin)
