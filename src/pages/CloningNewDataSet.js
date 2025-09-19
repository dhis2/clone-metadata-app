import React, { useState } from 'react';
import { 
    Layer,
    CenteredContent, 
    CircularLoader, 
    NoticeBox, 
    hasValue,
    DataTable,
    DataTableHead,
    DataTableBody,
    DataTableRow,
    DataTableCell,
    DataTableColumnHeader,
    Button,
    ButtonStrip,
    colors,
    IconShare16,
    InputField,
    SingleSelectField,
    SingleSelectOption,
    CheckboxField,
    Transfer,
    Required
} from '@dhis2/ui';
import PageHeader from '../components/PageHeader.js';
import { 
    FormSection
} from "../components/Form.js";
import SharingDialog from '../components/sharingdialog/SharingDialog.js';
import { useDataMutation, useDataEngine, useAlert } from '@dhis2/app-runtime';
import { cloneDataSetMetadata } from "../utils/cloneMetadataDataSet.js";
import { cloneUser, checkValidPassword } from "../utils";
import classes from './CloningNewProgram.module.css';

const mutation = {
    resource: "metadata?importMode=COMMIT",
    type: 'create',
    data: ({ data }) => data
};

const CloningNewDataSet = ({ metadata }) => {

    const [configuration, setConfiguration] = useState({
        dataSetTemplate: {
            id: null,
            prefix: null,
            fromIdx: "0",
            toIdx: "0"
        },
        userTemplate: {
            id: null,
            password: null,
            roles: []
        },
        dataSetDependencies: {
            dataSets: true,
            dataElements: true,
        },
        sharingSettings: {
            dataSets: {
                publicAccess: '--------',
                userAccesses: [
                    {
                        access: 'rwrw----',
                        name: 'Cloning User',
                        id: ''
                    }
                ],
                userGroupAccesses: [],
            },
            dataElements_agg: {
                publicAccess: '--------',
                userAccesses: [
                    {
                        access: 'rwrw----',
                        name: 'Cloning User',
                        id: ''
                    }
                ],
                userGroupAccesses: [],
            }
        }
    });
    const [sharingDialog, setSharingDialog] = useState({
        open: false,
        metadata: null,
        title: null
    });
    const [processing, setProcessing] = useState(false);
    const [isValidPassword, setIsValidPassword] = useState(true);

    const [mutate, { error, data, engine }] = useDataMutation(mutation, {
        onError: error => {
            setProcessing(false);
        }
    });
    // const engine = useDataEngine();

    const { show } = useAlert(
        ({ message }) => message,
        {
            critical: true,
            duration: 3000
        }
    );

    const updateSharingSettings = newSharingSettings => {
        setConfiguration({
            ...configuration,
            sharingSettings: {
                ...configuration.sharingSettings,
                [sharingDialog.metadata]: newSharingSettings
            }
        })
    }

    const handleReset = () => {
        setConfiguration({
            dataSetTemplate: {
                id: null,
                prefix: null,
                fromIdx: "0",
                toIdx: "0"
            },
            userTemplate: {
                id: null,
                password: null,
                roles: []
            },
            dataSetDependencies: {
                dataSets: true,
                dataElements: true
            },
            sharingSettings: {
                dataSets: {
                    publicAccess: '--------',
                    userAccesses: [
                        {
                            access: 'rwrw----',
                            name: 'Cloning User',
                            id: ''
                        }
                    ],
                    userGroupAccesses: [],
                },
                dataElements_agg: {
                    publicAccess: '--------',
                    userAccesses: [
                        {
                            access: 'rwrw----',
                            name: 'Cloning User',
                            id: ''
                        }
                    ],
                    userGroupAccesses: [],
                }
            }
        })
    }

    return (
        <>
            {processing && <Layer translucent>
                <CenteredContent>
                    <CircularLoader />
                </CenteredContent>
            </Layer>}
            <PageHeader>Cloning New Data Sets</PageHeader>
            <div className={classes.form}>
                <FormSection title={'Data set information'}>
                    <SingleSelectField
                        required
                        name="dataSet"
                        label={'Data set'}
                        placeholder={'Select a data set'}
                        onChange={ ({selected}) => {
                            setConfiguration({
                                ...configuration,
                                dataSetTemplate: {
                                    ...configuration.dataSetTemplate,
                                    id: selected
                                }
                            })
                        }}
                        className={classes.singleSelectField}
                        selected={configuration.dataSetTemplate.id}
                        filterable
                        noMatchText="No match found"
                    >
                    {
                        metadata.dataSets.dataSets.map( ({id, displayName}) => (
                            <SingleSelectOption 
                                key={id}
                                label={displayName}
                                value={id}
                                active={id === configuration.dataSetTemplate.id}
                            />
                        ))
                    }
                    </SingleSelectField>
                    <InputField
                        required
                        name="prefix"
                        label={'Prefix'}
                        value={configuration.dataSetTemplate.prefix}
                        validate={hasValue}
                        className={classes.textField}
                        onChange={({value}) => {
                            setConfiguration({
                                ...configuration,
                                dataSetTemplate: {
                                    ...configuration.dataSetTemplate,
                                    prefix: value
                                }
                            })
                        }}
                    />
                    <div className={classes.inline}>
                        <InputField
                            required
                            name="fromIdx"
                            label={'From Index'}
                            type="number"
                            value={configuration.dataSetTemplate.fromIdx}
                            validate={hasValue}
                            className={classes.numberField}
                            onChange={({value}) => {
                                setConfiguration({
                                    ...configuration,
                                    dataSetTemplate: {
                                        ...configuration.dataSetTemplate,
                                        fromIdx: value
                                    }
                                })
                            }}
                        />
                        <InputField
                            required
                            name="toIdx"
                            label={'To Index'}
                            type="number"
                            value={configuration.dataSetTemplate.toIdx}
                            validate={hasValue}
                            className={classes.numberField}
                            onChange={({value}) => {
                                setConfiguration({
                                    ...configuration,
                                    dataSetTemplate: {
                                        ...configuration.dataSetTemplate,
                                        toIdx: value
                                    }
                                })
                            }}
                        />
                    </div>
                </FormSection>
                <FormSection title={'User information'}>
                    <SingleSelectField
                        required
                        name="user"
                        label={'User'}
                        placeholder={'Select an user'}
                        onChange={ ({selected}) => {
                            setConfiguration({
                                ...configuration,
                                userTemplate: {
                                    ...configuration.userTemplate,
                                    id: selected
                                }
                            })
                        }}
                        className={classes.singleSelectField}
                        selected={configuration.userTemplate.id}
                        filterable
                        noMatchText="No match found"
                    >
                    {
                        metadata.users.users.map( ({id, displayName}) => (
                            <SingleSelectOption 
                                key={id}
                                label={displayName}
                                value={id}
                                active={id === configuration.userTemplate.id}
                            />
                        ))
                    }
                    </SingleSelectField>
                    <InputField
                        required
                        name="password"
                        label={'Password'}
                        type="password"
                        value={configuration.userTemplate.password}
                        validate={hasValue}
                        className={classes.textField}
                        onChange={({value}) => {
                            setConfiguration({
                                ...configuration,
                                userTemplate: {
                                    ...configuration.userTemplate,
                                    password: value
                                }
                            })
                        }}
                        onBlur={() => {
                            setIsValidPassword(checkValidPassword(configuration.userTemplate.password));
                        }}
                        helpText="Password should be between 8 and 72 characters long, with at least one lowercase character, one uppercase character, one number, and one special character."
                        error={!isValidPassword}
                        validationText={!isValidPassword && "Invalid password"}
                    />
                    <Transfer
                        name="userRoles"
                        leftHeader={<h3 className={classes.transferFieldHeader}>Available user roles</h3>}
                        rightHeader={<h3 className={classes.transferFieldHeader}>{`User roles this user is assigned`} <Required /></h3>}
                        options={metadata.userRoles.userRoles.map(({ displayName, id }) => ({
                            label: displayName,
                            value: id,
                        }))}
                        filterPlaceholder="Search"
                        filterable
                        className={classes.field}
                        height="320px"
                        selected={configuration.userTemplate.roles}
                        onChange={({selected}) => {
                            setConfiguration({
                                ...configuration,
                                userTemplate: {
                                    ...configuration.userTemplate,
                                    roles: selected
                                }
                            })
                        }}
                    />
                </FormSection>
                <FormSection title={'Data set dependencies'}>
                    <div className={classes.incolumn}>
                        <CheckboxField
                            name="datasets"
                            label={'Data sets'}
                            checked={configuration.dataSetDependencies.dataSets}
                            disabled
                            className={classes.field}
                        />
                        <CheckboxField
                            name="dataelements"
                            label={'Data elements'}
                            checked={configuration.dataSetDependencies.dataElements}
                            disabled
                            className={classes.field}
                        />
                    </div>
                </FormSection>
                <FormSection title={'Sharing settings'}>
                    <br/>
                    <DataTable>
                        <DataTableHead>
                            <DataTableColumnHeader>Metadata</DataTableColumnHeader>
                            <DataTableColumnHeader></DataTableColumnHeader>
                        </DataTableHead>
                        <DataTableBody>
                            <DataTableRow>
                                <DataTableCell>Data sets</DataTableCell>
                                <DataTableCell align='right'>
                                    <Button
                                        small
                                        secondary
                                        icon={<IconShare16 color={colors.grey600} />}
                                        onClick={() => {
                                            setSharingDialog({
                                                open: true,
                                                metadata: 'dataSets',
                                                title: "Data sets"
                                            })
                                        }}
                                    ></Button>
                                </DataTableCell>
                            </DataTableRow>
                            <DataTableRow>
                                <DataTableCell>Data elements</DataTableCell>
                                <DataTableCell align='right'>
                                    <Button
                                        small
                                        secondary
                                        icon={<IconShare16 color={colors.grey600} />}
                                        onClick={() => {
                                            setSharingDialog({
                                                open: true,
                                                metadata: 'dataElements_agg',
                                                title: "Data elements"
                                            })
                                        }}
                                    ></Button>
                                </DataTableCell>
                            </DataTableRow>
                        </DataTableBody>
                    </DataTable>
                </FormSection>
                <ButtonStrip>
                    <Button
                        primary
                        type="submit"
                        onClick={async () => {
                            if ( configuration.dataSetTemplate.id === null || configuration.userTemplate.id === null || configuration.dataSetTemplate.prefix === null || Number(configuration.dataSetTemplate.fromIdx) > Number(configuration.dataSetTemplate.toIdx) || configuration.userTemplate.password === null ) {
                                show({ message: `Please fill all required fields.` });
                            }
                            else if ( !isValidPassword) {
                                show({ message: 'Password is invalid.' });
                            }
                            else {
                                setProcessing(true);
                                const baseMetadata = await engine.query({
                                    baseDataSetMetadata: {
                                        resource: `dataSets/${configuration.dataSetTemplate.id}/metadata`
                                    },
                                    baseUser: {
                                        resource: 'users',
                                        id: configuration.userTemplate.id,
                                        params: {
                                            fields: [
                                                ":owner",
                                                "!created",
                                                "!lastUpdated",
                                                "userCredentials[:owner,!created,!lastUpdated,!lastUpdatedBy,!user,!lastLogin,!passwordLastUpdated]"
                                            ]
                                        }
                                    }
                                });

                                // await doWork(configuration,baseMetadata,engine);
                                let importingData = {
                                    users: []
                                };
                                for (let id = parseInt(configuration.dataSetTemplate.fromIdx); id <= parseInt(configuration.dataSetTemplate.toIdx); id++) {
                                    console.log(`Starting cloning process for user ${id} in instance`);
                            
                                    const password = configuration.userTemplate.password;
                                    const userRoles = configuration.userTemplate.roles;
                            
                                    const user = await cloneUser(`${configuration.dataSetTemplate.prefix}_${id}`,baseMetadata.baseUser,password,userRoles,engine);
                                    const dataSetMetadata = await cloneDataSetMetadata(`${configuration.dataSetTemplate.prefix}_${id}`,configuration,baseMetadata.baseDataSetMetadata,user.id,engine);
                            
                                    importingData.users = [
                                        ...importingData.users,
                                        ...[user]
                                    ];
                                    for ( const key in dataSetMetadata ) {
                                        if ( importingData[key] ) {
                                            importingData[key] = [
                                                ...importingData[key],
                                                ...dataSetMetadata[key]
                                            ]
                                        }
                                        else {
                                            importingData[key] = dataSetMetadata[key]
                                        }
                                    }
                                }

                                await mutate({ data: importingData });

                                handleReset();
                                setProcessing(false);
                            }
                        }}
                    >
                        Clone
                    </Button>
                    <Button 
                        onClick={() => {
                            handleReset();
                        }} 
                    >
                        Reset
                    </Button>
                </ButtonStrip>
                {error && <><br/><NoticeBox
                    error
                    title={'Importing error!'}
                >
                    {error.message}
                </NoticeBox></>}
                {data && <><br/><NoticeBox
                    valid
                    title={'Success!'}
                >
                    Cloning success
                </NoticeBox></>}
            </div>
            {sharingDialog.open && <SharingDialog
                title={sharingDialog.title}
                onClose={() => {
                    setSharingDialog({
                        open: false,
                        metadata: null,
                        title: null
                    })
                }}
                sharingSettings={configuration.sharingSettings}
                metadata={sharingDialog.metadata}
                onUpdateSharingSettings={updateSharingSettings}
            />}
        </>
    )
}

export default CloningNewDataSet;