import React, { Component } from "react";
import { Link } from "react-router-dom";


export default {
    title: 'authentication',
    content: (
        <div>
            <p>
                You need username and password to login MDBBM, the default username is admin, 
                default password is admin. you can change the username and password by configuring 
                MDBBM with your own <Link to="/docs?tab=setup">configuration file</Link>.
            </p>
        </div>
    )
}