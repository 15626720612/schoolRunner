const db = wx.cloud.database();
const jobDetail = db.collection('jobDetail');
const util = require('../../../utils/utils')

Page({

  data: {
    offerList: [],
    clickIndex: -1
  },

  onLoad: function (options) {
    this.getOfferList();
  },
  getOfferList(){
    let _openid = getApp().globalData.openid;
    db.collection('jobDetail').where({
      _openid
    }).orderBy('date','desc').get().then((res)=>{
      for (let i = 0; i < res.data.length; i++) {
        const element = res.data[i];
        if(element.jobDocList) {
          for (let j = 0; j < element.jobDocList.length; j++) {
            const item = element.jobDocList[j];
            item.date = util.formatDate(item.date);  
          }
        }
      }
      this.setData({
        offerList: res.data
      })
    }).catch((e)=>{
      console.error(e)
    })
  },
  onExp(e){
    let {index} = e.currentTarget.dataset;
    if(index === this.data.clickIndex) {
      this.setData({
        clickIndex: -1
      })
    }else {
      this.setData({
        clickIndex: index
      })
    }
  },

  // 聘用
  employ(item){
    console.log(item.currentTarget.dataset.item._id)
    const data = item.currentTarget.dataset.item
    if(data.employList){
      data.employList.push(item.currentTarget.dataset.jobDocItem)
    }else{
      console.log('mmm',item.currentTarget.dataset.jobdocitem)
      data.employList = [item.currentTarget.dataset.jobdocitem]
    }
    console.log(data)
    jobDetail.doc(item.currentTarget.dataset.item._id).update({
      data: {
        employList:data.employList
      }
    }).then((res) => {
      wx.showToast({
        title: '聘用成功'
      })
    })
  },

  showJobList(e){
    let {jobdoclistindex, index} = e.currentTarget.dataset;
    let fileID = this.data.offerList[index].jobDocList[jobdoclistindex].url;
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: (res) => {
        let url = res.fileList[0].tempFileURL;
        wx.downloadFile({
          url,
          success: (re) => {
            const filePath = re.tempFilePath;
            wx.openDocument({
              filePath,
              success: function (res) {
                wx.showToast({
                  title: '正在打开，请耐心等待...',
                })
              }
            })
          }
        })
      }
    })
  }
})