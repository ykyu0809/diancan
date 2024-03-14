// pages/me/me.js
const app = getApp();
Page({
 // 页面的初始数据
 data: {
  isShowUserName: false,
  userInfo: null,
 },

//  // button获取用户信息
//  onGotUserInfo: function(e) {
//   if (e.detail.userInfo) {
//    app.getOpenid(app)
//    var user = e.detail.userInfo;
//    this.setData({
//     isShowUserName: true,
//     userInfo: e.detail.userInfo,
//    })
//    user.openid = app.globalData.openid;
// //    app._saveUserInfo(user);
//   } else {
//    app._showSettingToast('登陆需要允许授权');
//   }
//  },
// button获取用户信息
 getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '获取你的头像、昵称', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
        })
        app.globalData.tableNum = this.data.userInfo.realzhuohao
        // console.log(res)
        var user = res.userInfo;
        user.openid = app.globalData.openid;
        // console.log("user: ",user)
        app.globalData.userInfo = user;
        console.log('请求获取user成功')
        console.log("user: ", user)
        app._saveUserInfo(user);
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        if (app.userInfoReadyCallback) {
         app.userInfoReadyCallback(res)
        }
      },
      fail: (res) => {
        console.log(res)
        //拒绝授权
        wx.showToast({
            title: '您拒绝了请求,不能正常使用小程序',
            icon: 'error',
            duration: 2000
        })
        console.log('请求获取user失败')
        var userStor = wx.getStorageSync('user');
        if (userStor) {
        console.log('本地获取user')
        app.globalData.userInfo = userStor;
        }
      }
  })
},

 goToMyOrder: function() {
  wx.navigateTo({
   url: '../myOrder/myOrder',
  })
 },

 goToMyComment: function() {
  wx.navigateTo({
   url: '../mycomment/mycomment?type=1',
  })
 },
 change(){
  wx.navigateTo({
   url: '../change/change',
  })
 },
 onShow(options) {
//   console.log("切换到个人页面", options)
  var user = app.globalData.userInfo;
  if (user) {
   this.setData({
    isShowUserName: true,
    userInfo: user,
   })
  }
 },

 //生命周期函数--监听页面加载
 onLoad: function(options) {
//   app.getOpenid(app)
  console.log("加载个人页面")
  var that = this;
  var user = app.globalData.userInfo;
  if (user) {
   // that.setData({
   //  isShowUserName: true,
   //  userInfo: user,
   // })
  } else {
   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
   // 所以此处加入 callback 以防止这种情况
   app.userInfoReadyCallback = res => {
    that.setData({
     userInfo: res.userInfo,
     isShowUserName: true
    })
   }
  }
 },
})