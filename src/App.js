import React, { useState } from 'react'
import {
    CssVariables,
    CssReset,
    NoticeBox, 
    Menu, MenuItem,
    CenteredContent, 
    CircularLoader, 
} from '@dhis2/ui'
import { useDataQuery } from '@dhis2/app-runtime'
import classes from './App.module.css'
import CloningNewProgram from './pages/CloningNewProgram'
import CloningNewDataSet from './pages/CloningNewDataSet'
import CloningNewDataSetProgram from './pages/CloningNewDataSetProgram'

const query = {
    userRoles: {
        resource: 'userRoles',
        params: {
            fields: ['id', 'displayName'],
            paging: false,
        },
    },
    dataSets: {
        resource: 'dataSets',
        params: {
            fields: ['id', 'displayName'],
            paging: false,
        }
    },
    programs: {
        resource: 'programs',
        params: {
            fields: ['id', 'displayName'],
            paging: false,
        }
    },
    users: {
        resource: 'users',
        params: {
            fields: ['id', 'displayName'],
            paging: false,
        },
    }
}

const App = () => {

    const [menu, setMenu] = useState("");

    // const { isDisconnected: offline } = useDhis2ConnectionStatus();
    const { loading, error, data } = useDataQuery(query);

    if (loading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    if (error) {
        return (
            <NoticeBox
                error
                title={'Error fetching program metadata'}
            >
                There was an error fetching metadata.
            </NoticeBox>
        )
    }
    
    return (
        <>
            <CssReset />
            <CssVariables spacers colors />
            <main className={classes.container}>
                <nav
                    role="nav"
                    aria-label="Main Navigation"
                    className={classes.nav}
                >
                    <Menu>
                        <MenuItem 
                            active={menu === "program"}
                            onClick={() => setMenu("program")}
                            label={"Program"}
                            className={classes.navItem}
                        />
                        <MenuItem 
                            active={menu === "dataSet"}
                            onClick={() => setMenu("dataSet")}
                            label={"Data Set"}
                            className={classes.navItem}
                        />
                        <MenuItem 
                            active={menu === "all"}
                            onClick={() => setMenu("all")}
                            label={"Data Set and Program"}
                            className={classes.navItem}
                        />
                    </Menu>
                </nav>
                <div className={classes.content}>
                {    
                    menu === "program" && <CloningNewProgram metadata={data} />
                }
                {
                    menu === "dataSet" && <CloningNewDataSet metadata={data} />
                }
                {
                    menu === "all" && <CloningNewDataSetProgram metadata={data} />
                }
                </div>
            </main>
        </>
    )
}

export default App
