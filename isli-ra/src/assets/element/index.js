import { Button, Row, Form, FormItem, Input, Col, Icon, Image } from 'element-ui'

const element = {
  install: function (Vue) {
    Vue.use(Button)
    Vue.use(Row)
    Vue.use(Form)
    Vue.use(FormItem)
    Vue.use(Input)
    Vue.use(Col)
    Vue.use(Icon)
    Vue.use(Image)
  }
}

export default element
