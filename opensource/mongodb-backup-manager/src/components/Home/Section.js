import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { getTop } from 'utility/smoothscroll'; 


class Section extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const props = this.props;
       
        return (
            <section id={ props.sectionId } ref={ section => this.main = section }>
                <i className="arrow fa fa-angle-up arrow-up" onClick={ props.onUp }></i>
                <div className="wrapper">
                    <div className='description' >{ props.description }</div>
                    <div className='img-container'>
                        <img src={ props.backgroundImage }/>
                    </div>
                </div>
                {
                    props.last? 
                    null
                    :<div className="arrow fa fa-angle-down arrow-down" onClick={ props.onDown }></div>
                }
            </section>
        )
    }

}

export default Section;