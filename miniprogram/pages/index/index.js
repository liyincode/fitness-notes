const app = getApp()

const plugin = requirePlugin("WechatSI")

const manager = plugin.getRecordRecognitionManager()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    dialogList: [],

    scroll_top: 10000, // 竖向滚动条位置

    initTranslate: {
      // 为空时的卡片内容
      create: '04/27 15:37',
      text: '等待说话',
    },

    recording: false,  // 正在录音

    toView: 'fake',  // 滚动位置

    // 是否已获取用户信息
    logged: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })

    // 初始化语音插件    
    this.initRecord()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 获取用户基本信息 
   */
  onGetUserInfo: function (e) {
    console.log(e)
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  /**
   * 保存文字和语音 
   */
  addContent: function () {
    console.log(e)
    const db = wx.cloud.database()
    db.collection('content').add({
      data: {
        text: this.text 
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        wx.showToast({
          title: '新增记录成功',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '新增记录失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },

  /**
  * 触摸开始
  */
  streamRecord: function (event) {
    // console.log(event)
    manager.start()
  },

  /**
   * 触摸结束
   */
  endStreamRecord: function (event) {
    // console.log(event)
    manager.stop()
  },

  /**
   * 上传语音
   */
  uploadRecoding: function(res) {
      /**
       * 开始上传语音
       */
      wx.showLoading({
        title: '上传语音中',
      })

      const filePath = res.tempFilePath

      const cloudPath = 'recording/2' + filePath.match(/\.[^.]+?$/)[0]
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success: res => {
          console.log('[上传文件] 成功：', res)

        },
        fail: e => {
          console.error('[上传文件] 失败：', e)
          wx.showToast({
            icon: 'none',
            title: '上传失败',
          })
        },
        complete: () => {
          wx.hideLoading()
        }
      })
  },

  /**
   * 
   */
  initRecord: function () {

    // 正常录音时调用此事件
    manager.onStart = (res) => {
      console.log(res)
    }

    // 识别结束事件
    manager.onStop = (res) => {
      console.log(res)
      this.setData({
        text: res.result
      })
      // 上传语音
      this.uploadRecoding(res)
      this.addContent()
    }

    // 识别错误事件
    manager.onError = (res) => {
      console.log(res)
    }

    // 有新的识别内容返回，则会调用此事件
    manager.onRecognize = (res) => {
      console.log(res)

    }
  },

  test: function(e) {
    console.log(e)
  }

})