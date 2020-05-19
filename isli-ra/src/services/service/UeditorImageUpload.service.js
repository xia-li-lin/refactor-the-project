import { IMAGE_ERROE, ImageUpload, ImageVaildOptions } from '../core-http'
const PIS_MPRIMAGE_UPLOADER = '/pis/v1/async/images'
export class UeditorImageUploadService {
  constructor (http) {
    const option = new ImageVaildOptions()
    option.validError = this.validImage.bind(this)
    this.imageServ = new ImageUpload(http, PIS_MPRIMAGE_UPLOADER, option)
  }

  registerShowErrorMsgCall (func) {
    this.showErrorMsg = func
  }

  registerSuccess (func) {
    this.success = func
  }

  registerFailed (func) {
    this.failedFunc = func
  }

  registerloading (func) {
    this.loadingFunc = func
  }

  validImage (errType) {
    let errorMsg
    if (errType === IMAGE_ERROE.NO_ERRROR) {
    } else if (errType === IMAGE_ERROE.FIEL_TYPE_ERROR) {
      errorMsg = '图片格式不支持'
    } else if (errType === IMAGE_ERROE.SIZE_ERROR) {
      errorMsg = '图片不能超过2M'
    } else if (errType === IMAGE_ERROE.CONTENT_ERROR) {
      errorMsg = '不能识别的图片'
    } else if (errType === IMAGE_ERROE.UPLOAD_ERROR) {
      errorMsg = '上传失败'
    } else {
      errorMsg = '图片分辨率不支持'
    }
    if (errorMsg) {
      this.showErrorMsg && this.showErrorMsg(errorMsg)
    }
  }

  // 上传图片
  uploadImage (imageFile, imageWidth, imageHeight, fileName, fileSize) {
    this.imageServ.setImageFile(imageFile)
    return this.imageServ
      .post(
        {
          owner: 'ueditor',
          targetId: 'ueditor',
          effective: '0'
        },
        {}
      )
      .before(() => {
        this.loadingFunc && this.loadingFunc()
      })
      .success((response) => {
        const imageRes = response.data
        this.success && this.success(imageRes.thumbnailUrl, imageRes.imageId || '')
      })
      .error(() => {
        this.failedFunc && this.failedFunc()
      })
  }
}
