import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Navigation extends Component {

    render() {
        const props = this.props;

        return (
            <div className={'navigation' + (props.menuOpen? ' open': '')}>
                <Link className='item' to="" onClick={ props.onTabClick } >Home</Link>
                <Link className='item' to="get_started" onClick={ props.onTabClick } >Get Started</Link>
                <Link className='item' to="docs?tab=new" onClick={ props.onTabClick } >Docs</Link>
                <a className='item' target="_blank" href="https://github.com/XiaocongDong/mongodb-backup-manager" onClick={ props.onTabClick }><i className="fa fa-github"></i></a>
            </div>
        )
    }

}

export default Navigation;