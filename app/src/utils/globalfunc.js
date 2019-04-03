import { NativeModules, Platform } from 'react-native'
import { strings } from '../locales/i18n';
import Toast from 'react-native-root-toast';

const supportedFormats = ['doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx', 'xps']

export function getLanguageCode() {
  let systemLanguage = 'en';
  if (Platform.OS === 'android') {
    systemLanguage = NativeModules.I18nManager.localeIdentifier;
  } else {
    systemLanguage = NativeModules.SettingsManager.settings.AppleLocale;
  }
  return systemLanguage;
}

export function getFileFormatIcon(filename, bLarge) {
  if(bLarge) {
    if(filename.endsWith('.doc')) {
      return icons.icon_format_big_doc;
    }
    if(filename.endsWith('.docx')) {
      return icons.icon_format_big_docx;
    }
    if(filename.endsWith('.pdf')) {
      return icons.icon_format_big_pdf;
    }
    if(filename.endsWith('.ppt')) {
      return icons.icon_format_big_ppt;
    }
    if(filename.endsWith('.pptx')) {
      return icons.icon_format_big_pptx;
    }
    if(filename.endsWith('.xls')) {
      return icons.icon_format_big_xls;
    }
    if(filename.endsWith('.xlsx')) {
      return icons.icon_format_big_xlsx;
    }
    if(filename.endsWith('.xps')) {
      return icons.icon_format_big_xps;
    }
    return icons.icon_format_big_unknown;  
  } else {
    if(filename.endsWith('.doc') || filename.endsWith('.docx')) {
      return icons.icon_format_small_doc;
    }
    if(filename.endsWith('.pdf')) {
      return icons.icon_format_small_pdf;
    }
    if(filename.endsWith('.ppt') || filename.endsWith('.pptx')) {
      return icons.icon_format_small_ppt;
    }
    if(filename.endsWith('.xls') || filename.endsWith('.xlsx')) {
      return icons.icon_format_small_xls;
    }
    if(filename.endsWith('.xps')) {
      return icons.icon_format_small_xps;
    }
    return icons.icon_format_small_unknown;  
  }   
}

export function isSupportedFormat(filepath) {
  for(var i = 0; i < supportedFormats.length; i++) {
    if(filepath.endsWith('.' + supportedFormats[i])) {
      return true
    }
  }
  return false
}

export function getDocumentDescription (date, pages, size) {
    // get date string for '18-Dec-2017' type
    var creationDate = new Date(date);
    const locale = getLanguageCode();

    let month = strings('month')[creationDate.getMonth()]
    var strDate = [creationDate.getDate(), month, creationDate.getFullYear()].join('-')

    // get page info
    var strPage = pages + ' ' + strings('files.pagecount')

    // get size info
    var strSize = size + ' KB'

    return [strDate, strPage, strSize].join(' | ');
}

export function showToast(message) {
  // Add a Toast on screen.
  let toast = Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      onShow: () => {
          // calls on toast\`s appear animation start
      },
      onShown: () => {
          // calls on toast\`s appear animation end.
      },
      onHide: () => {
          // calls on toast\`s hide animation start.
      },
      onHidden: () => {
          // calls on toast\`s hide animation end.
      }
  });

  // You can manually hide the Toast, or it will automatically disappear after a `duration` ms timeout.
  // setTimeout(function () {
  //     Toast.hide(toast);
  // }, 500);
}

const icons = {
  icon_format_big_doc: require('../../assets/img/ico_format_big_doc.png'),
  icon_format_big_docx: require('../../assets/img/ico_format_big_docx.png'),
  icon_format_big_pdf: require('../../assets/img/ico_format_big_pdf.png'),
  icon_format_big_ppt: require('../../assets/img/ico_format_big_ppt.png'),
  icon_format_big_pptx: require('../../assets/img/ico_format_big_pptx.png'),
  icon_format_big_xls: require('../../assets/img/ico_format_big_xls.png'),
  icon_format_big_xlsx: require('../../assets/img/ico_format_big_xlsx.png'),
  icon_format_big_xps: require('../../assets/img/ico_format_big_xps.png'),
  icon_format_big_unknown: require('../../assets/img/ico_format_big_unknown.png'),  
  icon_format_small_doc: require('../../assets/img/ico_format_small_doc.png'),
  icon_format_small_pdf: require('../../assets/img/ico_format_small_pdf.png'),
  icon_format_small_ppt: require('../../assets/img/ico_format_small_ppt.png'),
  icon_format_small_xls: require('../../assets/img/ico_format_small_xls.png'),
  icon_format_small_xps: require('../../assets/img/ico_format_small_xps.png'),
  icon_format_small_unknown: require('../../assets/img/ico_format_small_unknown.png'),  
}