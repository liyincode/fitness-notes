// miniprogram/pages/test/test.js
const app = getApp()

const util = require('../../utils/util.js')

const plugin = requirePlugin("WechatSI")

const db = wx.cloud.database()

const innerAudioContext = wx.createInnerAudioContext()

Page({

    /**
     * 页面的初始数据
     */
    data: {

        contentData: [],

        //用户信息
        userInfo: {
            avatarUrl: "https://blog.firedata.club/fcbe77826d4dc256802d535ad5c1aca6",
            nickName: '请点击头像'
        },
        openid: '',

        // 没有数据提示
        showNo: false,
        // 当前播放文件
        currentPlay: {},
        // 当前文件识别文字
        modelContent: "",
        // 播放音频状态
        playType: "stop"
    },
    /**
     * 打开详情弹窗
     */
    showModal(e) {

        this.setData({
            modalName: e.currentTarget.dataset.target,
            modelContent: e.currentTarget.dataset.currenttext
        })
    },
    /**
     * 关闭详情弹窗
     */
    hideModal(e) {
        this.setData({
            modalName: null
        })
    },
    /**
     * 点击播放按钮
     */
    clickPlayVoice: function(e) {
        console.log(e)
        let currentPlay = e.currentTarget.dataset.currentplay;
        if (currentPlay.fileID != this.data.currentPlay.fileID) {
            console.log('切换了音频！')
        }
        this.setData({
            currentPlay: currentPlay
        })


        if (this.data.playType == 'playing') {
            // 如果当前正在播放, 就停止播放
            this.stopVoice()
        } else {
            // 如果停止播放，就播放
            this.playVoice()
        }


    },
    /**
     * 播放背景录音
     */
    playVoice: function(e) {

        let item = this.data.currentPlay;
        // 音频标题

        // 音频数据源
        let play_path = item.fileID

        if (!play_path) {
            console.warn(" no voice path")
            return
        }

        console.log('play_path', play_path)
        innerAudioContext.src = play_path
        innerAudioContext.play();
        this.setData({
            playType: "playing"
        })


    },
    /**
     * 停止播放录音
     */
    stopVoice: function() {
        console.log('停止播放!')
            // let item = this.data.currentPlay;
            //   // 音频标题

        //   // 音频数据源
        //   let play_path = item.fileID

        //   if (!play_path) {
        //       console.warn(" no voice path")
        //       return
        //   }
        //   innerAudioContext.src = play_path
        innerAudioContext.stop();
        this.setData({
            playType: "stop"
        })
    },
    /**
     * 获取内容 
     */
    getContent: function() {
        wx.showLoading({
            title: '加载中',
        })
        let _this = this;
        // 获取 openid
        wx.cloud.callFunction({
            name: 'login',
            success: res => {
                console.log('callFunction login result: ', res)
                let openid = res.result.openid
                db.collection('content')
                    .orderBy('created_at', 'desc')
                    .where({
                        _openid: openid // 填入当前用户 openid
                    })
                    .get({
                        success(res) {
                            console.log('通过 openid 获取用户内容成功', res.data)
                                // 时间格式化
                            res.data.forEach(element => {
                                let recordTime = util.recordTime(element.created_at)
                                element.recordTime = recordTime
                            });
                            _this.setData({
                                contentData: res.data
                            })
                            console.log("页面当前内容", _this.data.contentData)
                            if (_this.data.contentData.length <= 0) {
                                _this.setData({
                                    showNo: true
                                })
                            }
                            wx.hideLoading()
                        }
                    })
            }
        })
    },
    /**
     * 获取用户信息
     */
    bindGetUserInfo: function(e) {
        console.log('用户信息', e)
            // 未登录
        if (e.detail.userInfo) {
            let empUserInfo = e.detail.userInfo
            this.setData({
                    userInfo: empUserInfo
                })
                // 将用户信息存入 storage
            wx.setStorage({
                key: 'userInfo',
                data: this.data.userInfo
            })
            app.globalData.userInfo = empUserInfo;
        } else {
            console.log('用户已登录或拒绝授权信息')
        }

    },

    onChange(event) {
        this.setData({
            activeNames: event.detail
        });
    },
    /**
     * 初始化全局数据
     */
    initGlobalData: function() {
        if (!app.globalData.userInfo) {
            return
        }
        this.setData({
            userInfo: app.globalData.userInfo,
            openid: app.globalData.openid,
        })
        let data = {
            userInfo: app.globalData.userInfo,
            openid: app.globalData.openid,
        }
        console.log("内容页初始化后的全局参数", data)
    },
    initAudio: function() {
        innerAudioContext.onPlay(() => {
            console.log('开始播放')
        })
        innerAudioContext.onError((res) => {
            console.log('监听音频播放错误事件')
            console.log(res.errMsg)
            console.log(res.errCode)
        })
        innerAudioContext.onCanplay(() => {
            console.log('监听音频进入可以播放状态的事件。但不保证后面可以流畅播放')
        })
        innerAudioContext.onPause(() => {
            console.log('监听音频暂停事件')
        })
        innerAudioContext.onStop(() => {
            console.log('监听音频停止事件')
        })
        innerAudioContext.onEnded(() => {
            console.log('监听音频自然播放至结束的事件')
            this.setData({
                playType: "stop"
            })
        })
        innerAudioContext.onWaiting(() => {
            console.log('监听音频加载中事件。当音频因为数据不足，需要停下来加载时会触发')
        })
        innerAudioContext.onSeeking(() => {
            console.log('监听音频进行跳转操作的事件')
        })
        innerAudioContext.onSeeked(() => {
            console.log('监听音频完成跳转操作的事件')
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function() {

        this.initAudio()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        this.initGlobalData();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.getContent();
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
        //this.getContent();
    },

    /**
     * 用户点击右上角分享
     */
    // onShareAppMessage: function() {

    // },


})