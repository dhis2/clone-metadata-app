import React from 'react';
import Modal from './Modal';
import { AccessAdd } from './AccessAdd';
import { AccessList } from './AccessList';
import { convertConstantToAccess, convertAccessToConstant } from "../../utils/index.js"

const SharingDialog = ({
    title,
    onClose,
    sharingSettings,
    metadata,
    onUpdateSharingSettings
}) => {

    const onAdd = ({ type: newType, id: newId, name, metadataAccess, dataAccess }) => {
        if ( newType === "group" ) {
            onUpdateSharingSettings({
                ...sharingSettings[metadata],
                userGroupAccesses: [
                    ...sharingSettings[metadata].userGroupAccesses,
                    ...[{
                        access: convertConstantToAccess({
                            metadata: metadataAccess,
                            data: dataAccess
                        }),
                        id: newId,
                        name
                    }]
                ]
            })
        }
        if ( newType === "user" ) {
            onUpdateSharingSettings({
                ...sharingSettings[metadata],
                userAccesses: [
                    ...sharingSettings[metadata].userAccesses,
                    ...[{
                        access: convertConstantToAccess({
                            metadata: metadataAccess,
                            data: dataAccess
                        }),
                        id: newId,
                        name
                    }]
                ]
            })
        }
    }

    const onChange = ({ type: changedType, id: changedId, access }) => {
        if ( changedType === "group" ) {
            onUpdateSharingSettings({
                ...sharingSettings[metadata],
                userGroupAccesses: sharingSettings[metadata].userGroupAccesses.map( currentAccess => changedId === currentAccess.id ? {
                    ...currentAccess,
                    access: convertConstantToAccess(access)
                } : currentAccess)
            })
        }
        if ( changedType === "user" ) {
            onUpdateSharingSettings({
                ...sharingSettings[metadata],
                userAccesses: sharingSettings[metadata].userAccesses.map( currentAccess => changedId === currentAccess.id ? {
                    ...currentAccess,
                    access: convertConstantToAccess(access)
                } : currentAccess)
            })
        }
        if ( changedType === "public" ) {
            onUpdateSharingSettings({
                ...sharingSettings[metadata],
                publicAccess: convertConstantToAccess(access)
            })
        }
    }

    const onRemove = ({ type: removedType, id: removedId }) => {
        if ( removedType === "group" ) {
            onUpdateSharingSettings({
                ...sharingSettings[metadata],
                userGroupAccesses: sharingSettings[metadata].userGroupAccesses.filter( ({id}) => id !== removedId )
            })
        }
        if ( removedType === "user" ) {
            onUpdateSharingSettings({
                ...sharingSettings[metadata],
                userAccesses: sharingSettings[metadata].userAccesses.filter( ({id}) => id !== removedId )
            })
        }
    }

    return (
        <Modal onClose={onClose} name={title}>
            <AccessAdd onAdd={onAdd} />
            <AccessList
                users={sharingSettings[metadata].userAccesses}
                groups={sharingSettings[metadata].userGroupAccesses}
                publicAccess={sharingSettings[metadata].publicAccess}
                onChange={onChange}
                onRemove={onRemove}
            />
        </Modal>
    )
}

export default SharingDialog;