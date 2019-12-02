import React, { Component } from 'react';
import SideBar from './SideBar';
import 'url-search-params-polyfill';
import { navigations, details } from './data';

class Docs extends Component {

    constructor(props) {
        super(props);
        this.handleTabClick = this.handleTabClick.bind(this);
        this.getKeyFromProps = this.getKeyFromProps.bind(this);
    }

    handleTabClick(key) {
        this.props.history.push(`/docs?tab=${key}`);
    }

    componentDidUpdate(prevProps) {
        const prevKey = this.getKeyFromProps(prevProps);
        const key = this.getKeyFromProps(this.props);

        if(key !== prevKey) {
            this.contentDOM.scrollTop = 0;
            this.contentDOM.scrollLeft = 0;
        }
    }

    getKeyFromProps(props) {
        const params = new URLSearchParams(props.location.search);
        const key = params.get('tab') || 'new';

        return key;
    }

    render() {
        const props = this.props;
        const key = this.getKeyFromProps(this.props);
        const d = details[key];

        return (
            <div className='docs content'>
                <SideBar
                    navigations={ navigations }
                    onTabClick={ this.handleTabClick.bind(this) }
                    selectedKey={ key }
                />
                <div className="docs-content" ref={ content => this.contentDOM = content }>
                    <div className="content-title">{ d.title }</div>
                    <div className="details">
                        {
                            d.content
                        }
                    </div>
                </div>                
            </div>
        )
    }
}

export default Docs;