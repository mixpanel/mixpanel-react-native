import {MixpanelConfig} from "mixpanel-react-native/javascript/mixpanel-config";

export class MixpanelLogger {
  static _shouldLog(token) {
    return MixpanelConfig.getInstance().getLoggingEnabled(token);
  }

  static _prependPrefix(args) {
    return ["[Mixpanel]", ...args];
  }

  static log(token, ...args) {
    if (MixpanelLogger._shouldLog(token)) {
      console.log(...MixpanelLogger._prependPrefix(args));
    }
  }

  static info(token, ...args) {
    if (MixpanelLogger._shouldLog(token)) {
      console.info(...MixpanelLogger._prependPrefix(args));
    }
  }

  static warn(token, ...args) {
    if (MixpanelLogger._shouldLog(token)) {
      console.warn(...MixpanelLogger._prependPrefix(args));
    }
  }

  static error(token, ...args) {
    if (MixpanelLogger._shouldLog(token)) {
      console.error(...MixpanelLogger._prependPrefix(args));
    }
  }
}
