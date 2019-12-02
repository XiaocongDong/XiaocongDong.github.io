import React, { Component } from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import Header from 'components/Header';
import Home from 'components/Home';
import Docs from 'components/Docs';
import GetStarted from 'components/GetStarted';


class RouterMaps extends Component {

    render() {
        return (
            <HashRouter>
                <div className="router-root">
                    <Header/>
                    <Switch>
                        <Route exact path='/' component={ Home }/>
                        <Route exact path='/docs' component={ Docs }/>
                        <Route exact path='/get_started' component={ GetStarted }/>
                    </Switch>
                </div>
            </HashRouter>
        )
    }
}

export default RouterMaps;
