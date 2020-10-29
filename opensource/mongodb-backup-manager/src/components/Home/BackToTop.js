import React, { Component } from 'react';
import smoothScroll from 'utility/smoothscroll';


class BackToTop extends Component {

    constructor(props) {
        super(props);
        this.scrollHandler = this.handleScroll.bind(this);
        this.state = {
            show: false
        }
    }

    componentDidMount() {
        window.addEventListener("scroll", this.scrollHandler, false);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.scrollHandler, false);
    }

    handleScroll() {
        const y = window.scrollY, windowHeight = window.innerHeight;

        if(y < windowHeight) this.setState({show : false})
        else this.setState({show: true}) 
    }

    scrollToTop() {
        const top = document.getElementById("home-top");
        smoothScroll(top);
    }

    render() {
        const { show } = this.state;

        return show? 
            (
                <div className="back-to-top">
                    <i 
                        className="fa fa-arrow-circle-up" 
                        onClick={ this.scrollToTop.bind(this) }
                        title="back to the top"
                    >
                    </i>
                </div>
            )
            : null;
    }
}

export default BackToTop;
