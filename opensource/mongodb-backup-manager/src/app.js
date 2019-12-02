import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import RouteMap from 'Routes/routeMap';


import 'sass/style.scss';

/*const PlaceHolder = props => {
    return (
        <div className='home'>
            home
        </div>
    )
}*/

ReactDOM.render(<RouteMap />, document.getElementById('root'))