import React, { Component } from 'react';
import MenuIcon from './MenuIcon';
import Navigation from './Navigation';
import Logo from './Logo';


class Header extends Component {

    constructor(props) {
        super(props);
        this.state = {
            menuOpen: false
        }
    }

    handleMenuIconClick() {
        this.setState({
            menuOpen: !this.state.menuOpen
        })
    }

    handleTabClick() {
        this.setState({
            menuOpen: !this.state.menuOpen
        })
    }

    render() {
        const { menuOpen } = this.state;

        return (
            <header>
                <Logo/>
                <Navigation
                    menuOpen={ menuOpen }
                    onTabClick={ this.handleTabClick.bind(this) }
                />
                <MenuIcon
                    onClick={ this.handleMenuIconClick.bind(this) }
                    menuOpen={ menuOpen }
                />
            </header>
        )
    }
}

export default Header;