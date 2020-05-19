import { BaseSevice } from '../core-http'

const GET_LANGUAGE = '/api/publishprotal/common/languages' // 语种
const GET_PRODUCT_FORMAT = '/api/publishprotal/common/product-format' // 产品形式
const GET_PUBLISHER_COUNTRY = '/api/publishprotal/common/publisher-country' // 出版地
const GET_ZT = '/api/publishprotal/common/classify/zt' // 中图分类
// eslint-disable-next-line camelcase
const GET_CHANNEl_URL = '/api/publishprotal/common/channel' // 渠道商
const GET_DZYXLX = '/pgs/v1/category-client/get/dzyxlx' // 电子音像--类型
const GET_ADDRESS = '/pas/v1/regions/:id'
const PLATFORM_CLASSIFY = '/api/publishprotal/common/platform-classify' // 平台商品分类
const SHOPGOODS_CLASSIFY = '/pgcs/v1/classification/1/:shopId' // 书店商品分类

export class CommonService extends BaseSevice {
  languages () {
    return this.http.get(GET_LANGUAGE)
  }

  getProductFormat () {
    return this.http.get(GET_PRODUCT_FORMAT)
  }

  getPublisheCountry () {
    return this.http.get(GET_PUBLISHER_COUNTRY)
  }

  getPlatformType () {
    return this.http.get(PLATFORM_CLASSIFY, {}, {})
  }

  getShopType (isliShopId) {
    return this.http.get(SHOPGOODS_CLASSIFY, { shopId: isliShopId }, {})
  }

  getZt () {
    return this.http.get(GET_ZT).translate((data) => {
      console.log(data)
      // const arr = []
      // data.forEach((element) => {
      //   const classifyNameZH = element.classifyKey + '-' + element.classifyNameZH
      //   arr.push(new ProductFormatModel(element.classifyKey, classifyNameZH, null, element.classifyNameEN));
      // })
      return data
    })
  }

  getChannel () {
    return this.http.get(GET_CHANNEl_URL)
  }

  getAddress (id) {
    return this.http.get(GET_ADDRESS, { id })
  }

  getAudioType () {
    return this.http.get(GET_DZYXLX).translate((data) => {
      if (!data) {
        return []
      }
      data.childs = data.childs || []
      let musicTypes = []
      let obj
      let secondObj
      data.childs.forEach((value) => {
        obj = { id: value.key, name: value.i18n.name, parentId: 0, level: 1, key: value.fullKey }
        musicTypes.push(obj)
        if (value.childs) {
          value.childs.forEach((second) => {
            secondObj = { id: second.key, name: second.i18n.name, parentId: obj.id, level: 2, key: second.fullKey }
            musicTypes.push(secondObj)
            if (second.childs) {
              second.childs.forEach((elem) => {
                musicTypes.push({
                  id: elem.key,
                  name: elem.i18n.name,
                  parentId: secondObj.id,
                  level: 3,
                  key: elem.fullKey
                })
              })
            }
          })
        }
      })
      data = musicTypes
      return data
    })
  }
}
