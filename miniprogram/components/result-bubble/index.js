
// 获取**全局唯一**的背景音频管理器**recordRecoManager**
const backgroundAudioManager = wx.getBackgroundAudioManager()

Component({

  properties: {

    // item 格式
    //  item: {
    //     create: '04/27 15:37',
    //     text: '一二三四五',
    //     translateText: '12345',
    //     voicePath: '',
    //     translateVoicePath: '',
    //     id: 0,
    //   },
    // 列表中每个 item
    item: {
      type: Object,
      value: {}
    },
    // item 索引
    index: {
      type: Number,
    },
    // 录音状态
    recordStatus: {
      type: Number,
      value: 2, // 0：正在识别，1：正在翻译，2：翻译完成
    },

  },

  data: {
    modalShow: false, // 显示悬浮框

    playType: 'wait', // 语音播放状态

    edit_icon_path: '../../images/edit.png'
  },

  methods: {

    /**
     * 显示悬浮框
     */
    showModal: function () {
      this.setData({ modalShow: true })
    },
    /**
     * 离开悬浮框
     */
    modalLeave: function() {
      this.setData({modalShow: false})
    },

    /**
     * 点击播放按钮
     */
    clickPlayVoice: function () {

      if (this.data.playType == 'playing') {
        // 如果当前正在播放, 就停止播放
        backgroundAudioManager.stop()
        this.playAnimationEnd()
      } else {
        // 如果停止播放，就播放
        this.playVoice()
      }


    },

    /**
     * 播放背景音乐
     */
    playVoice: function () {

      // 音频标题
      backgroundAudioManager.title = ''
      // 音频长度
      backgroundAudioManager.duration = this.data.item.temVoiceDuration
      // 音频数据源
      let play_path = this.data.item.temVoicePath

      if (!play_path) {
        console.warn(" no voice path")
        return
      }

      this.playAnimationStart()
      backgroundAudioManager.src = play_path

      // 监听背景音乐自然播放结束事件
      backgroundAudioManager.onEnded(() => {
        console.log("play voice end")
        this.playAnimationEnd()
      })
      // 监听背景音乐播放事件
      backgroundAudioManager.onPlay(() => {
        console.log('voice is palying')
        this.playAnimationStart()
      })
      // 监听背景音乐加载中事件
      backgroundAudioManager.onWaiting(() => {
        console.log('voice is loading')
        this.playAnimationLoading()
      })

    },

    /**
     * 开始播放动画
     */
    playAnimationStart: function () {
      this.setData({
        playType: 'playing',
      })

    },

    /**
     * 结束播放动画
     */
    playAnimationEnd: function () {
      this.setData({
        playType: 'wait',
      })
    },
    /**
     * 加载播放动画
     */
    playAnimationLoading: function () {
      this.setData({
        playType: 'loading',
      })
    },
  }




});