import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class GetStarted extends Component {

    render() {
        const props = this.props;

        return (
            <div className="docs content">
                <div className="get-started-content">
                    <div className="title">Get Started</div>
                    <div className="step">
                        <div className="step-title">
                            1. install mongodb-backup-manager globally
                        </div>
                        <code>
                                # Via npm<br/>
                                npm install mongodb-backup-manager -g
                        </code>
                    </div>
                    <div className="step">
                        <div className="step-title">
                            2. run mongodb-backup-manager
                        </div>
                        <code>
                             mongodb-backup-manager 
                        </code>
                        <p>
                            look at <Link to="/docs?tab=setup">setup</Link> page for more information about 
                            how to configure mongodb backup manager and how to use it!
                        </p>
                    </div>
                </div>
            </div>
        )
    }
}

export default GetStarted;
