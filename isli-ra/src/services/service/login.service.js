import { BaseSevice } from '../core-http'

const POST_LOGIN_URL = '/isli/irms/manage-manager/base/v1/login'
const POST_SEND_VALIDCODE = '/isli/irms/manage-manager/base/v1/sendSMS'

export class LoginService extends BaseSevice {
  // 发送验证码
  sendValidCode (userName) {
    return this.http.post(POST_SEND_VALIDCODE, {}, {langCode: 'ZH_TW', selectedLanguage: 'ZH_TW'}, { mobile: userName })
  }

  login (userInfo) {
    const {mobileCode, ...data} = userInfo
    return this.http.post(
      POST_LOGIN_URL,
      {},
      {langCode: 'ZH_TW', selectedLanguage: 'ZH_TW'},
      Object.assign({}, {mobileCode: mobileCode.toString()}, data))
      .after((res) => {
        console.log(res)
        if (res && res.success) {
          console.log(1)
        }
      })
  }
}
