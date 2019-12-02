import React from 'react';
import { Link } from 'react-router-dom';


export default {
        title: "config the backup roles",
        content: (
            <div>
                 <p>
                    MDBBM determines if you have the right to backup a specific
                    a database by roles, if you have the following roles on the database:
                </p>
                <ul>
                    <li><strong>Database Administration Roles:</strong> dbOwner</li>
                    <li><strong>Database User Roles:</strong> readWrite</li>
                    <li><strong>All-Database Roles:</strong> readWriteAnyDatabase</li>
                </ul>
                <p>
                    mongo backup manager will assume that you can backup that database<br/><br/>
                    if you want to changes the default backup roles, you can <Link to="/docs?tab=setup">run MDBBM with your own configuration file</Link>.
                </p>
            </div>
        )
}