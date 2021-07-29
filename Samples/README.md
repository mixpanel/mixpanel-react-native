
# Sample React Native Applications for Mixpanel Integration

This folder contains 3 sample applications demonstrating how you can use Mixpanel in your React Native app.
- SimpleMixpanel: Integrate Mixpanel with a minimalist approach
- MixpanelDemo: A full Mixpanel API demo app
- ContextAPIMixpanel: Integrate Mixpanel with Context API

# How to Run
## Prerequisites
- React Native v0.6+
- Prerequiste You need to set up the React Native development environment, follow the React Native CLI Quickstart section \
https://reactnative.dev/docs/environment-setup

## Getting Started
- Under the sample application's root directory, run `yarn install`
- Under the sample application's ios directory, run `pod install`

## Add your Mixpanel Token to app.json 
There is "token" value in app.json that you'll need to update
before you can send data to Mixpanel.

### For Your Mixpanel Token

- Log in to your account at https://www.mixpanel.com
- Select the project you'll be working with
- Click the gear link at the top right to show the project settings dialog
- Copy the "Token" string from the dialog

Change the value of "token" in app.json to the value you copied from the web page.

## Getting More Information

The Mixpanel React Native integration API documentation is available on the Mixpanel website.

https://developer.mixpanel.com/docs/react-native
