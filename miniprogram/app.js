//app.js
App({
    onLaunch: function() {

        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                traceUser: true,
            })
        }

        this.getGlobalData()


    },
    // 权限询问
    getRecordAuth: function() {
        wx.getSetting({
            success(res) {
                console.log("succ")
                console.log(res)
                if (!res.authSetting['scope.record']) {
                    wx.authorize({
                        scope: 'scope.record',
                        success() {
                            // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
                            console.log("succ auth")
                        },
                        fail() {
                            console.log("fail auth")
                        }
                    })
                } else {
                    console.log("record has been authed")
                }
            },
            fail(res) {
                console.log("fail")
                console.log(res)
            }
        })
    },

    // 获取用户信息
    getGlobalData: function() {
        let _this = this;
        wx.getStorage({
            key: 'userInfo',
            success(res) {
                console.log("小程序初始化获得用户信息", res.data)
                _this.globalData['userInfo'] = res.data
            }
        })
        wx.cloud.callFunction({
            name: 'login',
            success: res => {
                console.log('小程序初始化获得 openid ', res.result.openid)
                _this.globalData['openid'] = res.result.openid;
            }
        })
    },

    globalData: {
        openid: "",
        userInfo: {}
    }
})