import React from 'react';
import { Link } from 'react-router-dom';


export default {
    title: 'delete the backup schedule',
    content: (
        <div>
            <p>
                Click the "delete" button to delete an existing backup schedule
            </p>
            <img src='./static/img/delete_backup.png'/>
            <p>
                <strong>Notes: </strong>deleting the backup schedule will be always your last choice, 
                because all the copy databases and logs infos related to this backup schedule
                will also be deleted. So if you only want to stop the backup, 
                you can just <Link to="/docs?tab=stop">stop</Link> it, if you want to update the backup schedule, 
                you can just <Link to="/docs?tab=update">update</Link> it.
            </p>
        </div>
    )
}