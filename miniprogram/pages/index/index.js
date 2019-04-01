const app = getApp()

const util = require('../../utils/util.js')

const plugin = requirePlugin("WechatSI")

import { conf } from '../../utils/conf.js'

const manager = plugin.getRecordRecognitionManager()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    dialogList: [
    //   {
    //   // 当前语音输入内容
    //   create: '04/27 15:37',
    //   lfrom: 'zh_CN',
    //   lto: 'en_US',
    //   text: '这是测试这是测试这是测试这是测试',
    //   translateText: 'this is test.this is test.this is test.this is test.',
    //   voicePath: '',
    //   translateVoicePath: '',
    //   autoPlay: false, // 自动播放背景音乐
    //   id: 0,
    // },
    ],

    scroll_top: 10000, // 竖向滚动条位置

    bottomButtonDisable: false, // 说话按钮 disabled

    initTranslate: {
      // 为空时的卡片内容
      create: '04/27 15:37',
      text: '等待说话',
    },

    // 当前说话内容
    currentTranslate: {

    },

    recordStatus: 0,   // 状态： 0 - 录音中 1- 翻译中 2 - 翻译完成/二次翻译
    recording: false,  // 正在录音

    toView: 'fake',  // 滚动位置
    currentTranslateVoice: '', // 当前播放语音路径
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
  * 按住按钮开始语音识别
  */
  streamRecord: function (event) {
    console.log("触摸开始", event)

    manager.start()

    this.setData({
      recordStatus: 0, // 正在说话
      recording: true, // 正在说话
      currentTranslate: {
        // 当前说话内容
        create: util.recordTime(new Date()),
        text: '正在聆听中',
      }
    })
    this.scrollToNew();
  },

  /**
   * 松开按钮结束语音识别
   */
  endStreamRecord: function (event) {
    console.log('松开按钮结束语音识别',event)

    // 防止重复触发 stop 函数
    if(!this.data.recording || this.data.recordStatus != 0) {
      // 当前不正在录音
      console.warn('has finished!')
      return
    }

    manager.stop()

    // 说话按钮禁止
    this.setData({
      bottomButtonDisable: true,
    })
  },

    /**
   * 重新滚动到底部
   */
  scrollToNew: function() {
    // 弹出新输入语音框
    this.setData({
      toView: this.data.toView
    })
  },

  /**
   * 上传语音
   */
  uploadRecoding: function (res) {
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
   * 初始化语音识别回调
   * 绑定语音播放开始事件
   */
  initRecord: function () {

    // 正常录音时调用此事件
    manager.onStart = (res) => {
      console.log(res)
    }

    // 识别结束事件
    manager.onStop = (res) => {
      console.log('识别结束',res)

      let text = res.result

      if(text == '') {
        // 如果识别内容为空, 就显示「请说话」图示
        this.showRecordEmptyTip()
        return
      }

      let currentData = Object.assign({}, this.data.currentTranslate, {
        text: res.result,
        translateText: '正在翻译中',
        voicePath: res.tempFilePath
      })

      this.setData({
        currentTranslate: currentData,
        recordStatus: 1,

      })

      this.scrollToNew();
      // 上传语音
      // this.uploadRecoding(res)
      // this.addContent()
    }

    // 识别错误事件
    manager.onError = (res) => {
      console.log(res)
      this.setData({
        recording: false,
        bottomButtonDisable: false
      })
    }

    // 有新的识别内容返回，则会调用此事件
    manager.onRecognize = (res) => {
      console.log(res)
      // 将所有可枚举属性的值从一个或多个源对象复制到目标对象。它将返回目标对象。
      let currentData = Object.assign({}, this.data.currentTranslate, {
        text: res.result,
      })

      this.setData({
        currentTranslate: currentData,
      })

      this.scrollToNew;
    }

    // 语音播放开始事件
    wx.onBackgroundAudioPlay(res=>{
      const backgroundAudioManager = wx.getBackgroundAudioManager()
      let src = backgroundAudioManager.src
      console.log('捕获当前播放语音路径', src)

      this.setData({
        currentTranslateVoice: src
      })
    })
  },

  /**
   * 识别内容为空时的反馈
   */
  showRecordEmptyTip: function() {
    this.setData({
      recording: false,
      bottomButtonDisable: false,
    })

    wx.showToast({
      title: conf.recognize_nothing,
      icon: 'success',
      image: '/images/no_voice.png',
      duration: 1000,
      success: function(res) {
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      }
    })


  }


})