import { colors, spacers } from '@dhis2/ui-constants'
import { UserAvatar } from '@dhis2-ui/user-avatar'
import { IconUserGroup24 } from '@dhis2/ui-icons'
import { SingleSelectField, SingleSelectOption } from '@dhis2-ui/select'
import { Divider } from '@dhis2-ui/divider'
import { convertConstantToAccess, convertAccessToConstant } from "../../utils/index.js"
import React from 'react'

const Title = ({ children }) => {
    return (
        <>
            <h2>{children}</h2>
            <style jsx>{`
                h2 {
                    font-size: 16px;
                    color: ${colors.grey900};
                }
            `}</style>
        </>
    )
} 

const DestructiveSelectOption = ({ label, onClick }) => {
    return (
        <div onClick={onClick}>
            {label}
            <style jsx>{`
                div {
                    cursor: pointer;
                    font-size: 14px;
                    text-decoration: none;
                    color: ${colors.red700};
                    padding: ${spacers.dp8} ${spacers.dp12};
                }

                div:hover {
                    background-color: ${colors.red050};
                }
            `}</style>
        </div>
    )
}

const ListItemIcon = ({ target, name }) => {
    switch (target) {
        case "SHARE_TARGET_PUBLIC":
        case "SHARE_TARGET_GROUP":
            return <IconUserGroup24 color={colors.grey600} />
        case "SHARE_TARGET_USER":
            return <UserAvatar name={name} small />
        default:
            return null
    }
}

const ListItemContext = ({ access }) => {
    let message = 'Metadata: No access; Data: No access';

    if ( access.metadata === 'ACCESS_NONE_METADATA' && access.data === "ACCESS_NONE_DATA" ) {
        message = 'Metadata: No access; Data: No access';
    }
    if ( access.metadata === 'ACCESS_VIEW_METADATA' && access.data === "ACCESS_NONE_DATA" ) {
        message = 'Metadata: Can view; Data: No access';
    }
    if ( access.metadata === 'ACCESS_VIEW_METADATA' && access.data === "ACCESS_VIEW_DATA" ) {
        message = 'Metadata: Can view; Data: Can view';
    }
    if ( access.metadata === 'ACCESS_VIEW_METADATA' && access.data === "ACCESS_VIEW_AND_EDIT_DATA" ) {
        message = 'Metadata: Can view; Data: Can view and edit';
    }
    if ( access.metadata === 'ACCESS_VIEW_AND_EDIT_METADATA' && access.data === "ACCESS_NONE_DATA" ) {
        message = 'Metadata: Can view and edit; Data: No access';
    }
    if ( access.metadata === 'ACCESS_VIEW_AND_EDIT_METADATA' && access.data === "ACCESS_VIEW_DATA" ) {
        message = 'Metadata: Can view and edit; Data: Can view';
    }
    if ( access.metadata === 'ACCESS_VIEW_AND_EDIT_METADATA' && access.data === "ACCESS_VIEW_AND_EDIT_DATA" ) {
        message = 'Metadata: Can view and edit; Data: Can view and edit';
    }

    return (
        <p>
            {message}
            <style jsx>{`
                p {
                    font-size: 14px;
                    color: ${colors.grey700};
                    margin: 6px 0 0 0;
                    padding: 0;
                }
            `}</style>
        </p>
    )
}

const ListItem = ({
    name,
    target,
    access,
    metadata,
    onChange,
    onRemove,
    isRemovableTarget,
    disabled
}) => {
    // const valueToLabel = {
    //     ACCESS_NONE: i18n.t('No access'),
    //     ACCESS_VIEW_ONLY: i18n.t('View only'),
    //     ACCESS_VIEW_AND_EDIT: i18n.t('View and edit'),
    //     }

    const metadataAccessOptions = isRemovableTarget ? [
        {
            value: 'ACCESS_VIEW_METADATA',
            label: 'View',
        },
        {
            value: 'ACCESS_VIEW_AND_EDIT_METADATA',
            label: 'View and edit',
        }
    ] 
    : [
        {
            value: 'ACCESS_NONE_METADATA',
            label: 'No access',
        },
        {
            value: 'ACCESS_VIEW_METADATA',
            label: 'View',
        },
        {
            value: 'ACCESS_VIEW_AND_EDIT_METADATA',
            label: 'View and edit',
        }
    ]

    const dataAccessOptions = [
        {
            value: 'ACCESS_NONE_DATA',
            label: 'No access',
        },
        {
            value: 'ACCESS_VIEW_DATA',
            label: 'View',
        },
        {
            value: 'ACCESS_VIEW_AND_EDIT_DATA',
            label: 'View and edit',
        }
    ]

    return (
        <>
            <div className="wrapper">
                <div className="details">
                    <ListItemIcon target={target} name={name} />
                    <div className="details-text">
                        <p className="details-name">{name}</p>
                        <ListItemContext access={access} />
                    </div>
                </div>
                <div className="select">
                    <SingleSelectField
                        inputWidth="225px"
                        prefix={'Metadata'}
                        selected={access.metadata}
                        onChange={({ selected }) => onChange({
                            metadata: selected,
                            data: access.data
                        })}
                        disabled={disabled}
                    >
                        {metadataAccessOptions.map(({value,label}) => (
                            <SingleSelectOption
                                key={value}
                                label={label}
                                value={value}
                                active={value === access.metadata}
                            />
                        ))}
                        {isRemovableTarget && (
                            <DestructiveSelectOption
                                onClick={onRemove}
                                label={'Remove access'}
                            />
                        )}
                    </SingleSelectField>
                </div>
                <div className="select">
                    <SingleSelectField
                        inputWidth="225px"
                        prefix={'Data'}
                        selected={access.data}
                        onChange={({ selected }) => onChange({
                            metadata: access.metadata,
                            data: selected
                        })}
                        disabled={
                            disabled
                            || metadata === "dataElements_agg"
                            || metadata === "dataElements_trk"
                            || metadata === "programIndicators"
                            || metadata === "trackedEntityAttributes"
                            || metadata === "optionSets"
                        }
                    >
                        {dataAccessOptions.map(({value,label}) => (
                            <SingleSelectOption
                                key={value}
                                label={label}
                                value={value}
                                active={value === access.data}
                            />
                        ))}
                    </SingleSelectField>
                </div>
            </div>
            <Divider />
            <style jsx>{`
                .wrapper {
                    display: flex;
                    padding: 4px 8px;
                }

                .details {
                    display: flex;
                    flex: 2;
                }

                .details-text {
                    margin-inline-start: 8px;
                }

                .details-name {
                    font-size: 15px;
                    font-weight: 500;
                    color: ${colors.grey900};
                    margin: 0;
                    padding: 0;
                }

                .select {
                    flex: 1;
                }
            `}</style>
        </>
    )
}

// export const AccessList = ({
//      
// }) => {
export const AccessList = ({
    onChange,
    onRemove,
    publicAccess,
    metadata,
    users,
    groups
}) => {
    return <>
        <Title>{'Users and groups that currently have access'}</Title>
        <div className="header">
            <div className="header-left-column">{'User / Group'}</div>
            <div className="header-right-column">{'Access level'}</div>
        </div>
        <div className="list">
            <ListItem
                name={'All users'}
                target={'SHARE_TARGET_PUBLIC'}
                access={convertAccessToConstant(publicAccess)}
                metadata={metadata}
                onChange={(newAccess) =>
                    onChange({ type: 'public', access: newAccess })
                }
                isRemovableTarget={false}
                disabled={false}
            />
            {
                groups.map( ({id,name,access}) => (
                    <ListItem
                        name={name}
                        target={"SHARE_TARGET_GROUP"}
                        access={convertAccessToConstant(access)}
                        metadata={metadata}
                        onChange={(newAccess) =>
                            onChange({ type: 'group', id, access: newAccess })
                        }
                        onRemove={() => onRemove({ type: 'group', id })}
                        isRemovableTarget={true}
                        disabled={false}
                    />
                ))
            }
            {
                users.map( ({id,name,access}, index) => (
                    index === 0 || index === 1 ?
                    <ListItem
                        name={name}
                        target={"SHARE_TARGET_USER"}
                        access={convertAccessToConstant(access)}
                        metadata={metadata}
                        onChange={(newAccess) =>
                            onChange({ type: 'user', id, access: newAccess })
                        }
                        isRemovableTarget={false}
                        disabled={index === 0}
                    />
                    :
                    <ListItem
                        name={name}
                        target={'SHARE_TARGET_USER'}
                        access={convertAccessToConstant(access)}
                        metadata={metadata}
                        onChange={(newAccess) =>
                            onChange({ type: 'user', id, access: newAccess })
                        }
                        onRemove={() => onRemove({ type: 'user', id })}
                        isRemovableTarget={true}
                        disabled={false}
                    />
                ))
            }
        </div>
        <style jsx>{`
            .header {
                display: flex;
                padding: 10px 8px;
                margin: 0 0 8px 0;
                background-color: ${colors.grey200};
                color: ${colors.grey900};
                font-size: 13px;
            }

            .header-left-column {
                flex: 2;
            }

            .header-right-column {
                flex: 2;
            }

            .list {
                display: flex;
                flex-direction: column;
                overflow-y: auto;
            }
        `}</style>
    </>
}