
import { language } from '../../utils/conf.js'


Component({

  properties: {
    
    // item 格式
    
   item: {
      create: '04/27 15:37',
      text: '一二三四五',
      translateText: '12345',
      voicePath: '',
      translateVoicePath: '',
      id: 0,
    },
   
        // 录音状态
        // recordStatus: {
        //     type: Number,
        //     value: 2, // 0：正在识别，1：正在翻译，2：翻译完成
        // }
  },

  data: {
      modalShow: true, // 显示悬浮框
  }




});