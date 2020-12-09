<div align="center" style="text-align: center">
  <img src="https://github.com/mixpanel/mixpanel-android/blob/assets/mixpanel.png?raw=true" alt="Mixpanel React Native Library" height="150"/>
</div>

##### 
# Table of Contents

<!-- MarkdownTOC -->
- [Introduction](#introduction)
- [Quick Start Guide](#quick-start-guide)
    - [Installation](#installation)
    - [Integration](#integration)
- [I want to know more!](#i-want-to-know-more)

<!-- /MarkdownTOC -->


# Introduction
Welcome to the official Mixpanel React Native library.
The Mixpanel React Native library is an open-source project, and we'd love to see your contributions! 
We'd also love for you to come and work with us! Check out **[Jobs](https://mixpanel.com/jobs/#openings)** for details

# Quick Start Guide

Check out our **[official documentation](https://developer.mixpanel.com/docs/react-native)** for more in depth information on installing and using Mixpanel on React Native.

<a name="installation"></a>
## Installation
### Prerequisite
- React Native v0.6+
- [Setup development environment for React Native](https://reactnative.dev/docs/environment-setup)
### Steps
1. Under your app's root directory, install Mixpanel React Native SDK
```npm install mixpanel-react-native```
2. Under your application's ios folder, run
```pod install```
At this point, you are ready to use Mixpanel React Native SDK
## Integration
### Initialization
To start tracking with the library you must first initialize with your project token. To initialize the library, first add `import { Mixpanel }` and call `Mixpanel.init(token)` with your project token as it's argument. 
```js
import { Mixpanel } from 'mixpanel-react-native';
...
class YourClass extends React.Component {
    constructor(props) {
        super(props);
        this.configMixpanel();
    }

    configMixpanel = async () => {
        this.mixpanel = await Mixpanel.init("Your mixpanel token");
    }
...
```
Once you've called this method once, you can access `mixpanel` throughout the rest of your application.
### Tracking
Once you've initialized the library, Mixpanel will <a href="https://mixpanel.com/help/questions/articles/which-common-mobile-events-can-mixpanel-collect-on-my-behalf-automatically" target="_blank">automatically collect common mobile events</a>. You can enable/ disable automatic collection through your <a href="https://mixpanel.com/help/questions/articles/how-do-i-enable-common-mobile-events-if-i-have-already-implemented-mixpanel" target="_blank">project settings</a>.
With the `mixpanel` object created in [the last step](#integration) a call to `track` is all you need to send additional events to Mixpanel.
```js
// Track with event-name
mixpanel.track('TrackEvent');
// Track with event-name and property
mixpanel.track('TrackEvent', {'Status': 'Pending'});
```
You're done! You've successfully integrated the Mixpanel React Native SDK into your app. To stay up to speed on important SDK releases and updates, star or watch our repository on [Github](https://github.com/mixpanel/mixpanel-react-native).

<a name="i-want-to-know-more"></a>
# I want to know more!

No worries, here are some links that you will find useful:
* **[Sample app](https://github.com/mixpanel/mixpanel-react-native/tree/master/MixpanelDemo)**
* **[Full API Reference](https://developer.mixpanel.com/docs/react-native)**

Have any questions? Reach out to [support@mixpanel.com](mailto:support@mixpanel.com) to speak to someone smart, quickly.

