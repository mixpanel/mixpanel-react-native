import React, { Component } from 'react';
import Navigation from './Router';
import {MixpanelManager} from './Analytics';


export default class App extends Component {
    render() {
        return (
            <Navigation />
        );
    }
}
