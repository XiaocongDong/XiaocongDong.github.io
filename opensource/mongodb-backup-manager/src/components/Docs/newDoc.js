import React from 'react';
import { Link } from 'react-router-dom';

export default  {
        title: "create a new backup schedule",
        content: (
                    <div>   
                            <p>Click the '+' button at the top-right corner</p>
                            <img src="./static/img/new_config_wizard.png"/>
                            <p>
                                tell MDBBM how to connect to the mongo 
                                db sever
                            </p>
                            <img src="./static/img/new_credential.png"/>
                            <p>
                                <b>Notes: </b>MDBBM stores all the history connections 
                                in the browser, click the 'recent connections' option,
                                you can find all the history connections you aready made,
                                these history connections can also be deleted 
                            </p>
                            <img src="./static/img/new_history_conn.png"/>
                            <p>
                                after connecting to the mongoDB server, you can configure your
                                backup schedule on the specific database
                            </p>
                            <img src="./static/img/new_config.png"/>
                            <div>
                                about the confuguration options:
                                <ul>
                                    <li>
                                        <strong>backup database:</strong> the available databases for this option are fetched from the
                                        remote database, they are considered to be all the databases that you can backup
                                        in that database server, click <Link to='docs?tab=roles'>here</Link> to know 
                                        how MDBBM determines if you can backup one specific database.
                                    </li>
                                    <li>
                                        <strong>backup collections:</strong> after you select the backup database, you can choose 
                                        multiple collections in that database, the selected collections will be backup
                                        each time backup is run. You can also check the 'backup all the collections all the time' 
                                        option to backup all the collections in the current database whenever the backup is run.
                                    </li>
                                    <li>
                                        <strong>backup start time:</strong> backup start time is the starting time when the backup will be run,
                                        check the 'backup now' option, backup will be run right after you commit the backup
                                        configuration.
                                    </li>
                                    <li>
                                        <strong>backup interval:</strong> tell MDBBM how often the backup should be run,
                                        if you check the 'just backup one time' option, the backup will be run just one time,
                                        however, you can run the backup later by clicking the 'run' button in that &nbsp;
                                        <Link to="docs?tab=run">backup config panel</Link>.
                                    </li>
                                    <li>
                                        <strong>maximum copy databases:</strong> to save the storage in the local mongo database,
                                        MDBBM allows you to specify the maximum number of the copy databases 
                                        that can exist, copy database is the database each time MDBBM copy from
                                        the remote database. Be careful if you check the 'not applied' option, because, it means 
                                        the number of the copy databases will be unlimited, if you don't specify the existing time 
                                        for the copy database neither, your server storage may be used up by too many databases
                                        at some point.
                                    </li>
                                    <li>
                                        <strong>existing time for copy database:</strong> set the existing time for all the copy databases, e.g. 
                                        if the existing time is set to 7 days, the copy database will be deleted 7 days
                                        after it is created. you can disable this option by checking the 'not applied' option.
                                    </li>
                                </ul>
                            </div>
                            <p>
                                after setting the backup configuration, you can review it before you submit,
                                if you find someting wrong, you can go back to the previous steps to 
                                make any changes.
                            </p>
                            <img src='./static/img/new_review.png'/>
                    </div>
        )
            
}