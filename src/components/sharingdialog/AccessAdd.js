import { Button } from '@dhis2-ui/button'
import { SingleSelectField, SingleSelectOption } from '@dhis2-ui/select'
import { useDhis2ConnectionStatus } from '@dhis2/app-runtime'
import { colors, spacers } from '@dhis2/ui-constants'
import PropTypes from 'prop-types'
import React, { useState, useContext } from 'react'
import { SharingAutocomplete } from './aucocomplete/SharingAutocomplete.js';

export const AccessAdd = ({ metadata, onAdd }) =>  {
    const [entity, setEntity] = useState(null)
    const [metadataAccess, setMetadataAccess] = useState('')
    const [dataAccess, setDataAccess] = useState('ACCESS_NONE_DATA')
    const { isDisconnected: offline } = useDhis2ConnectionStatus()

    const onSubmit = (e) => {
        e.preventDefault()

        onAdd({
            type: entity.type,
            id: entity.id,
            name: entity.displayName || entity.name,
            metadataAccess,
            dataAccess
        })

        setEntity(null)
        setMetadataAccess('')
        setDataAccess('ACCESS_NONE_DATA')
    }

    const metadataAccessOptions = [
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
            <h2
                style={{
                    fontSize: "16px",
                    color: `${colors.grey900}`
                }}
            >{'Give access to a user or group'}</h2>
            <form onSubmit={onSubmit}>
                <SharingAutocomplete 
                    selected={entity?.displayName || entity?.name}
                    onSelection={setEntity}
                />
                <div className="select-wrapper">
                    <SingleSelectField
                        prefix="Metadata"
                        inputWidth="206px"
                        label={'Access level'}
                        placeholder={'Select a level'}
                        disabled={offline}
                        selected={metadataAccess}
                        helpText={
                            offline ? 'Not available offline' : ''
                        }
                        onChange={({ selected }) => setMetadataAccess(selected)}
                    >
                        {metadataAccessOptions.map(({ value, label }) => (
                            <SingleSelectOption
                                key={value}
                                label={label}
                                value={value}
                                active={value === metadataAccess}
                            />
                        ))}
                    </SingleSelectField>
                </div>
                <div className="select-wrapper">
                    <SingleSelectField
                        prefix="Data"
                        inputWidth="206px"
                        label={''}
                        placeholder={'Select a level'}
                        disabled={
                            offline
                            || metadata === "dataElements_agg"
                            || metadata === "dataElements_trk"
                            || metadata === "programIndicators"
                            || metadata === "trackedEntityAttributes"
                            || metadata === "optionSets"
                        }
                        selected={dataAccess}
                        helpText={
                            offline ? 'Not available offline' : ''
                        }
                        onChange={({ selected }) => setDataAccess(selected)}
                    >
                        {dataAccessOptions.map(({ value, label }) => (
                            <SingleSelectOption
                                key={value}
                                label={label}
                                value={value}
                                active={value === dataAccess}
                            />
                        ))}
                    </SingleSelectField>
                </div>
                <Button
                    type="submit"
                    disabled={offline || !entity || !metadataAccess || !dataAccess}
                >
                    {'Give access'}
                </Button>
            </form>
            <style jsx>{`
                form {
                    background-color: ${colors.grey100};
                    color: ${colors.grey900};
                    margin-bottom: 21px;
                    padding: 8px 12px;
                    border-radius: 5px;
                    display: flex;
                    align-items: flex-end;
                    gap: ${spacers.dp8};
                }

                .select-wrapper {
                    flex: 1;
                }
            `}</style>
        </>
    )
}

AccessAdd.propTypes = {
    onAdd: PropTypes.func.isRequired,
}