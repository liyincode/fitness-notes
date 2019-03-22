// miniprogram/pages/test/test.js
const app = getApp()
var plugin = requirePlugin("WechatSI")
let manager = plugin.getRecordRecognitionManager()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.initRecord()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  /**
   * 触摸开始
   */
  streamRecord: function(event) {
    // console.log(event)
    manager.start()
  },

  /**
   * 触摸结束
   */
  endStreamRecord: function(event) {
    // console.log(event)
    manager.stop()
  },

  /**
   * 
   */
  initRecord: function() {

    // 正常录音时调用此事件
    manager.onStart = (res) => {
      console.log(res)
    }

    // 识别结束事件
    manager.onStop = (res) => {
      console.log(res)

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
    }

    // 识别错误事件
    manager.onError = (res) => {
      console.log(res)
    }

    // 有新的识别内容返回，则会调用此事件
    manager.onRecognize = (res) => {
      console.log(res)
      
    }
  }
})