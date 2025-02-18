import { ButtonStrip, Button } from '@dhis2-ui/button'
import {
    Modal as Dhis2Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
} from '@dhis2-ui/modal'
import PropTypes from 'prop-types'
import React from 'react'

const Modal = ({ onClose, name, children }) => {
    const title = name
        ? `Sharing and access: ${name}`
        : 'Sharing and access'

    return (
        <Dhis2Modal fluid position="top" onClose={onClose}>
            <ModalTitle>{title}</ModalTitle>
            <ModalContent>{children}</ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button type="button" secondary onClick={onClose}>
                        Close
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Dhis2Modal>
    )
}

Modal.propTypes = {
    children: PropTypes.node.isRequired,
    name: PropTypes.string,
    onClose: PropTypes.func,
}

export default Modal;