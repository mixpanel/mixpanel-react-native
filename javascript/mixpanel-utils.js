import {MixpanelType} from 'mixpanel-react-native/javascript/mixpanel-constants';

export class SessionMetadata {
  constructor(trackingQueue) {
    this.eventsCounter = 0;
    this.peopleCounter = 0;
    this.sessionID = SessionMetadata.randomId();
    this.sessionStartEpoch = Math.round(Date.now() / 1000);
    this.trackingQueue = trackingQueue;
  }

  static randomId() {
    return (
      Math.floor(Math.random() * (1 << 30)).toString(16) +
      Math.floor(Math.random() * (1 << 30)).toString(16)
    ).padStart(16, '0');
  }

  toDict(type) {
    const dict = {
      $mp_metadata: {
        $mp_event_id: SessionMetadata.randomId(),
        $mp_session_id: this.sessionID,
        $mp_session_seq_id:
          type === MixpanelType.EVENTS
            ? this.eventsCounter
            : this.peopleCounter,
        $mp_session_start_sec: this.sessionStartEpoch,
      },
    };
    if (type === MixpanelType.EVENTS) {
      this.eventsCounter += 1;
    } else {
      this.peopleCounter += 1;
    }
    return dict;
  }
}
