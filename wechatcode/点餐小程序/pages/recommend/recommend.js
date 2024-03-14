// pages/recommend/recommend.js
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        row: 4,
        // len: 12,
        // choose: [],
        delicacies: [],
        haveFisnished: false,   //判断是否为推荐后的页面
        foodList: [],           // 用于将choose为1的菜品添加到购物车
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        var app = getApp()
        var that = this;
        wx.request({
            url: app.globalData.baseUrl + '/user/getProductInfo',
            success: function(res) {
                // console.log(res.data)
                let picData = res.data.data
                // console.log("第一项", picData[0])
                console.log(picData)
                let len = picData.length;
                for(let i = 0; i < len; i++){
                    // let name = `delicacies${i}`;
                    picData[i].choose = 0
                    that.setData({
                        // len: len,
                        [`delicacies[${i}]`]: picData[i],
                        // ["choose[" + i + "]"]: 0
                    })
                }
                that.setData({

                })
                console.log(that.data)
            }
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    onClickFood: function(e){
        let i = e.currentTarget.dataset.id
        if(this.data.delicacies[i].choose == 1){
            this.setData({
                // choose: 0
                [`delicacies[${i}].choose`]: 0
            })
            // this.data.delicacies[id].choose = 0
            console.log("取消选中", i, "号菜品\n现在它的choose值为：", this.data.delicacies[i].choose)
        }
        else{
            this.setData({
                // choose: 1
                [`delicacies[${i}].choose`]: 1
            })
            // this.data.delicacies[i].choose == 1
            console.log("选中了", i, "号菜品\n现在它的choose值为：", this.data.delicacies[i].choose)
        }
    },

    submitData: function(e){
        let that = this
        let pdata = this.data.delicacies
        wx.checkSession({
            success () {
                //session_key 未过期，并且在本生命周期一直有效
                console.log("已登陆")
                console.log(pdata)
                //显示加载界面
                wx.showLoading({  // 显示加载中loading效果 
                    title: "加载中",
                    mask: true  //开启蒙版遮罩
                });
  
                //你要做的事...
                wx.request({
                    url: app.globalData.recommendUrl, 
                    method: 'POST',
                    header: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                        delicacies: JSON.stringify(pdata)
                    }, 
                    success: function (res) {
                        console.log('已经提交数据到数据库')
                        // console.log(res)

                        let picData = res.data.data
                        // console.log("第一项", picData[0])
                        console.log(picData)
                        let len = picData.length;
                        for(let i = 0; i < len; i++){
                            // let name = `delicacies${i}`;
                            picData[i].choose = 0
                            that.setData({
                                [`delicacies[${i}]`]: picData[i],
                            })
                        }
                        that.setData({
                            haveFisnished: true
                        })
                        // that.onShow()
                    }
                })
                //隐藏加载界面
                wx.hideLoading();
            },
            fail () {
                // session_key 已经失效，需要重新执行登录流程
                wx.showModal({
                    title: '未登录',
                    content: '请登录点餐系统',
                    showCancel: false, //去掉取消按钮
                    success: function (res) {
                      if (res.confirm) {//这里是点击了确定以后
                            wx.navigateTo({
                            url: '../me/me',
                       })
                      } 
                    }
                  })
            }
          })
    }, 

    addCount: function(e){
        var that = this
        let delicacies = that.data.delicacies
        // console.log(delicacies)
        let num = 0
        for(var i in delicacies){  // 选中菜品的字段名调整至购物车所使用的字段名
            if (delicacies[i].choose == 1){
                that.setData({
                    [`foodList[${num}].id`]: delicacies[i].productId,
                    [`foodList[${num}].name`]: delicacies[i].productName,
                    [`foodList[${num}].price`]: delicacies[i].price,
                    [`foodList[${num}].stock`]: delicacies[i].stock,
                    [`foodList[${num}].desc`]: delicacies[i].desc,
                    [`foodList[${num}].icon`]: delicacies[i].productIcon,
                    [`foodList[${num}].quantity`]: 0,
                })
                num += 1
            }
        }
        // console.log(this.data.foodList)

        // 将选中的菜品添加到购物车
        var arr = wx.getStorageSync('cart') || [];
        // console.log(arr)
        for(var i in this.data.foodList){
            this.data.foodList[i].quantity += 1
            var id = this.data.foodList[i].id
            var f = false
            // console.log(this.data.foodList[i])
            if (arr.length > 0) {
                for (var j in arr) { // 遍历购物车找到被点击的菜品，数量加1
                 if (arr[j].id == id) {
                  arr[j].quantity += 1;
                  f = true;
                  try {
                   wx.setStorageSync('cart', arr)
                  } catch (e) {
                   console.log(e)
                  }
                  break;
                 }
                }
                if (!f) {
                 arr.push(this.data.foodList[i]);
                }
            } else {
                arr.push(this.data.foodList[i]);
               }
            try {
                wx.setStorageSync('cart', arr)
            } catch (e) {
                console.log(e)
            }
        }

        for(var i in delicacies){
            that.setData({
                [`delicacies[${i}].choose`]: 0,
            })
        }
        wx.showModal({
            title: '添加成功',
            content: '再去看看还有什么想点的吧',
            // showCancel: false, //去掉取消按钮
            confirmText: '去看看吧', 
            cancelText: '留在这里', 
            success: function (res) {
              if (res.confirm) {//这里是点击了确定以后
                    wx.navigateTo({
                        url: '../buy/buy?tableNum=' + app.globalData.tableNum
                    })
              } 
            }
        })
    }
})