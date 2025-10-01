import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { 
    Button,
    Modal,
    ModalContent,
    ModalActions,
    ModalTitle,
} from '@dhis2/ui';
import {
    IconInfo24
} from '@dhis2/ui-icons'
import classes from './PageHeader.module.css';

/**
 * Generic page header component used by all pages
 */
const PageHeader = ({ children }) => {
    const [help, setHelp] = useState(true);

    return (
        <div className={classes.container}>
            <h2 className={classes.header}>
                {children}
            </h2>
            <Button 
                className={classes.button}
                onClick={() => setHelp(false)}
                icon={<IconInfo24 />}
            ></Button>
            <Modal hide={help} position="middle" large>
                <ModalTitle>User Guide</ModalTitle>
                <ModalContent>
                    <div className={classes.helpContainer}>
                        <iframe
                            src={`https://docs.google.com/document/d/e/2PACX-1vSciGMTjBS0Y8RrBGIhAvhPnCs6NOhhBsB-MyoaeKkXtz1J5roaMa702I5vuYZEKRJyA4N_RqjUnCB5/pub?embedded=true`}
                            width="750px"
                            height="100%"
                            frameBorder="0"
                        ></iframe>
                    </div>
                </ModalContent>
                <ModalActions>
                    <Button onClick={() => setHelp(true)}>Close</Button>
                </ModalActions>
            </Modal>
        </div>
    );
}

PageHeader.propTypes = {
    children: PropTypes.node,
}

export default PageHeader