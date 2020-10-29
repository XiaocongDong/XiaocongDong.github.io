import React, { Component } from 'react';
import { getTitleWithKey } from './data';

class SideBar extends Component {
    
    constructor(props) {
        super(props);
        console.log(props.selectedKey);
        this.state = {
            opens: [getTitleWithKey(props.selectedKey)]
        }
    }

    handleItemClick(title) {
        let opens = JSON.parse(JSON.stringify(this.state.opens));
        
        opens.includes(title)?(opens = opens.filter(t => t !== title )): (opens.push(title));
        this.setState({
            opens
        })    
    }

    componentDidUpdate(prevProps, prevState) {
        let prevKey = prevProps.selectedKey;
        let currentKey = this.props.selectedKey;

        if(prevKey == currentKey) {
            return;
        }

        let prevTitle = getTitleWithKey(prevKey);
        let currentTitle = getTitleWithKey(currentKey);

        if(prevTitle == currentTitle) {
            return;
        }

        let opens = JSON.parse(JSON.stringify(this.state.opens));

        if(!opens.includes(currentTitle)) opens.push(currentTitle);

        this.setState({opens});
    }

    render() {
        const props = this.props;
        const { opens } = this.state;

        return (
            <div className='side-bar'>
                {
                    props.navigations.map((navigation, index) => {
                        return (
                            <div 
                                className={ "item" + (opens.includes(navigation.title)? " open": "")} 
                                key={ index }
                            >
                                <div className="title"  onClick={ this.handleItemClick.bind(this, navigation.title) }>{ navigation.title }</div>
                                <div className="item-tabs-wrapper">
                                <ul className="item-tabs">
                                {
                                    navigation.children.map((nav, i) => {
                                        return (
                                                <li 
                                                    key={ i } 
                                                    onClick={ () => props.onTabClick(nav.key) } 
                                                    className={"tab" + (props.selectedKey === nav.key? " selected": "")}
                                                >
                                                    {
                                                        nav.text
                                                    }
                                                </li>
                                            )
                                    })
                                }
                                </ul>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

class Tab extends Component {

    render() {

    }

}

export default SideBar;
