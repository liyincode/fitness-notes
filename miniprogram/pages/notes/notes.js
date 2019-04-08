// miniprogram/pages/test/test.js
const app = getApp()

const util = require('../../utils/util.js')

var base64 = require("../../images/base64")

Page({

  /**
   * 页面的初始数据
   */
  data: {

    userInfo: {
      avatarUrl: base64.icon60,
      nickName: '请点击头像'
    },
    loggedIn: false, // 是否登录

  },

  /**
   * 获取用户信息
   */
  bindGetUserInfo: function (e) {
    console.log('用户信息', e)
    // 未登录
    if (!this.data.loggedIn && e.detail.userInfo) {
      let empUserInfo = e.detail.userInfo
      this.setData({
        userInfo: empUserInfo
      })
      // 将用户信息存入 storage
      wx.setStorage({
        key: 'userInfo',
        data: this.data.userInfo
      })
    } else {
      console.log('用户已登录或拒绝授权信息')
    }

  },

  /**
   * 初始化用户信息
   */
  initUserInfo: function () {
    try {
      let userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.setData({
          userInfo: userInfo,
          loggedIn: true
        })
      }
    } catch (e) {
      console.log(e)
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.setData({
      icon20: base64.icon20,
      icon60: base64.icon60
    });

    this.initUserInfo();
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


})