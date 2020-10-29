import React from 'react';
import { Link } from 'react-router-dom';
import newDoc from './newDoc';
import runDoc from './runDoc';
import stopDoc from './resumeDoc';
import rolesDoc from './rolesDoc';
import notificationsDoc from './notificationsDoc';
import statisticsDoc from './statisticsDoc';
import updateDoc from './updateDoc';
import deleteDoc from './deleteDoc';
import restoreDoc from './restoreDoc';
import serverSetupDoc from './serverSetupDoc';
import authDoc from './authDoc';


export const navigations = [
    {
        title: "backup",
        children: [
            {
                text: "create",
                key: "new"
            },
            {
                text: "run",
                key: "run"
            },
            {
                text: "stop and resume",
                key: "stop"
            },
            {
                text: "update",
                key: "update"
            },
            {
                text: "delete",
                key: "delete"
            },
            {
                text: "statistics",
                key: "statistics"
            },
            {
                text: "notifications",
                key: "notifications"
            }
        ]
    },
    {
        title: "restore",
        children: [
            {
                text: "retore collections",
                key: "restore"
            }
        ]
    },
    {
        title: "configurations",
        children: [
            {
                text: "system",
                key: "setup"
            },
            {
                text: "authentication",
                key: "authentication"
            },
            {
                text: "backup roles",
                key: "roles"
            }
        ]
    }
    // {
    //     title: "contributions",
    //     children: [
    //         {
    //             text: "architecture",
    //             key: "architecture"
    //         },
    //         {
    //             text: "project struture",
    //             key: "structure"
    //         }
    //     ]
    // }
]

export const details = {
    new: newDoc,
    run: runDoc,
    stop: stopDoc,
    update: updateDoc,
    delete: deleteDoc,
    statistics: statisticsDoc,
    notifications: notificationsDoc,
    restore: restoreDoc,
    setup: serverSetupDoc,
    roles: rolesDoc,
    authentication: authDoc,
    // architecture: {
    //     title: "architecture of the project",
    //     content: ""
    // },
    // structure: {
    //     title: "structure of the code",
    //     content: ""
    // }
}

export const getTitleWithKey = (key) => {
    for(let nav of navigations) {
        
        for(let ch of nav.children) {

            if(ch.key === key) {
                return nav.title;
            }

        }
    }
}