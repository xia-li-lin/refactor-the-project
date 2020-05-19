export class ImageVaildOptions {
  constructor (
    validError,
    maxFileSize = 1024 * 1024 * 20,
    minWidth = 0,
    minHeight = 0,
    allowedType = [ 'jpg', 'jpeg', 'bmp', 'png' ]
  ) {
    this.validError = validError
    this.maxFileSize = maxFileSize
    this.minWidth = minWidth
    this.minHeight = minHeight
    this.allowedType = allowedType
  }
}

export class ImageFile {
  constructor (file, alias, fileName) {
    this.file = file
    this.alias = alias
    this.fileName = fileName
  }
}

export const IMAGE_ERROE = {
  NO_ERRROR: 0,
  WIDTH_ERROR: 1,
  HRIGHT_ERROR: 2,
  SIZE_ERROR: 3,
  FIEL_TYPE_ERROR: 4,
  CONTENT_ERROR: 5,
  UPLOAD_ERROR: 6
}

export class ImageUpload {
  constructor (httpServ, url, options, imageAlias = 'imageFile') {
    this.httpServ = httpServ
    if (this.httpServ && this.httpServ.headers && this.httpServ.headers['Content-Type']) {
      delete this.httpServ.headers['Content-Type']
    }
    this.url = url
    this.imageAlias = imageAlias
    this.options = options
  }
  setImageFile (imageFile) {
    this.imageFile = imageFile
    this.fileSize = imageFile.size
    this.fileType = imageFile.name.split('.').pop().toLowerCase()
    const image = new Image()
    const oFReader = new FileReader()
    let resolveFunc
    this.vaildPromise = new Promise(function (resolve) {
      resolveFunc = resolve
    })
    const self = this
    oFReader.onload = function (ofEvent) {
      image.src = ofEvent.target.result
      // eslint-disable-next-line semi
    };
    image.onload = function () {
      self.width = image.width
      self.height = image.height
      self.valid()
      resolveFunc(true)
      // eslint-disable-next-line semi
    };

    image.onerror = () => {
      if (self.options.validError) {
        self.options.validError(IMAGE_ERROE.CONTENT_ERROR)
      }
      self.validResult = false
      resolveFunc(false)
      // eslint-disable-next-line semi
    };
    oFReader.readAsDataURL(imageFile)
    return this
  }
  formatImageFile (fileBase64, width, height, fileSize, imageName = 'picture') {
    try {
      this.fileSize = fileSize
      const dataURIPattern = /^data:((.*?)(;charset=.*?)?)(;base64)?,/
      const macthes = fileBase64.match(dataURIPattern)
      if (!macthes) {
        this.valid()
        return false
      }
      if (width) {
        this.width = width
      }
      if (height) {
        this.height = height
      }
      const imgStr = fileBase64.substr(macthes[0].length)
      const byteString = atob(imgStr)
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      let fileType = macthes[1].split('/').pop()
      this.fileType = fileType.toLowerCase()
      fileType = '.' + fileType
      imageName = imageName.replace(fileType, '')
      this.imageFile = new File([ ab ], imageName + fileType, { type: macthes[1] })
      this.fileSize = this.imageFile.size
      if (!width || !height) {
        this.setImageFile(this.imageFile)
      } else {
        this.valid()
      }
    } catch (e) {
      console.error(e)
    }
    return this
  }

  valid () {
    this.vaildPromise = undefined
    let error = IMAGE_ERROE.NO_ERRROR
    if (this.options.maxFileSize < this.fileSize) {
      error = IMAGE_ERROE.SIZE_ERROR
    } else if (this.options.minWidth > this.width) {
      error = IMAGE_ERROE.WIDTH_ERROR
    } else if (this.options.minHeight > this.height) {
      error = IMAGE_ERROE.HRIGHT_ERROR
    } else if (this.options.allowedType && this.options.allowedType.indexOf(this.fileType) === -1) {
      error = IMAGE_ERROE.FIEL_TYPE_ERROR
    }
    if (this.options.validError) {
      this.options.validError(error)
    }

    if (error !== IMAGE_ERROE.NO_ERRROR) {
      this.validResult = false
      return false
    }
    this.validResult = true
    return true
  }

  post (formData, pathParam) {
    const imageFiles = [ new ImageFile(this.imageFile, this.imageAlias, this.imageFile && this.imageFile.name) ]
    const form = new FormData()
    pathParam = pathParam || {}
    formData = formData || {}
    for (const imageFile of imageFiles) {
      form.append(imageFile.alias, imageFile.file, imageFile.fileName)
    }
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        form.append(key, formData[key])
      }
    }
    return this.httpServ
      .post(this.url, pathParam, {}, form)
      .before(() => {
        if (!this.validResult) {
          return true
        }
      })
      .delay(this.vaildPromise)
  }

  put (formData, pathParam) {
    const imageFiles = [ new ImageFile(this.imageFile, this.imageAlias, this.imageFile && this.imageFile.name) ]
    const form = new FormData()
    pathParam = pathParam || {}
    formData = formData || {}
    for (const imageFile of imageFiles) {
      form.append(imageFile.alias, imageFile.file, imageFile.fileName)
    }
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        form.append(key, formData[key])
      }
    }
    return this.httpServ
      .put(this.url, pathParam, {}, form)
      .before(() => {
        if (!this.validResult) {
          return true
        }
      })
      .delay(this.vaildPromise)
  }
}
