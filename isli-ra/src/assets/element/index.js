import { Button, Row, Form, FormItem, Input, Col } from 'element-ui'

const element = {
  install: function (Vue) {
    Vue.use(Button)
    Vue.use(Row)
    Vue.use(Form)
    Vue.use(FormItem)
    Vue.use(Input)
    Vue.use(Col)
  }
}

export default element
