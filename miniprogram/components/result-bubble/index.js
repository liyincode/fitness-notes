
import { language } from '../../utils/conf.js'


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

    playType: 'playing', // 语音播放状态

    edit_icon_path: '../../images/edit.png'
  }




});