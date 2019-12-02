import React from 'react';

export default {
    title: "configuration of MDBBM",
    content: (
        <div>
            You can configure MDBBM in two ways, the first way is to run the MDBBM with some 
            arguments, e.g.
            <code>
                mongodb-backup-manager -p 8080 --log debug
            </code>
            <p>which will run the MDBBM at 8080 and set the log level to debug</p>
            <p>optional arguments for MDBBM:</p>
            <code>
                <pre>
                    -V, --version                 output the version number<br/>
                    -c --config                   config file for mongodb backup manager<br/>
                    -p --serverPort               mongodb backup manager port number<br/>
                    -i --interval                 interval for task pool scanning<br/>
                    --dbServer                    local database server address<br/>
                    --dbPort                      local database server port number<br/>
                    --username                    username for local database<br/>
                    --password                    password for local database<br/>
                    --authDB                      authentication DB for local database<br/>
                    --log                         log level for the system<br/>
                    -h, --help                    output usage information<br/>
                </pre>
            </code>
            <p>
                If you find the above options are not enough, you can configure MDBBM with your costomized 
                configuration file, the template configuration file is &nbsp;
                <a href="https://github.com/XiaocongDong/mongodb-backup-manager/blob/master/backup.config.json" target="__blank">backup.config.json</a>.
                download this file into your local environment, make some changes and run MDBBM with the following command: 
            </p>
            <code>
                mongodb-backup-manager -c your-own-config-file-path
            </code>
            <p>
                MDBBM will bu run with the configuration in your configuration file.
            </p>
        </div>
    )
}