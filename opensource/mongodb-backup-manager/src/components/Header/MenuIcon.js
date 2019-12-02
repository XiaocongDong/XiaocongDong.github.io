import React, { Component } from 'react';


class MenuIcon extends Component {

    render() {
        const props = this.props;

        return (
            <div className={"menu-icon" + (props.menuOpen? " open": "")} onClick={ props.onClick }>
                <div className='menu-line line1'></div>
                <div className='menu-line line2'></div>
                <div className='menu-line line3'></div>
            </div>
        )
    }
}

export default MenuIcon;