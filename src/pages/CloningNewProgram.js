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
import { cloneProgramMetadata } from "../utils/cloneMetadataProgram.js";
import { cloneUser, checkValidPassword } from "../utils";
import classes from './CloningNewProgram.module.css';

const mutation = {
    resource: "metadata?importMode=COMMIT",
    type: 'create',
    data: ({ data }) => data
};

const CloningNewProgram = ({ metadata }) => {

    const [configuration, setConfiguration] = useState({
        programTemplate: {
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
        programDependencies: {
            programs: true,
            programTrackedEntityAttributes: true,
            prgoramStages: true,
            programStageSections: true,
            programStageDataElements: true,
            programIndicators: true,
            programRules: true,
            trackedEntityTypes: false,
            trackedEntityAttributes: false,
            dataElements: false,
            optionSets: false
        },
        sharingSettings: {
            programs: {
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
            programStages: {
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
            programIndicators: {
                publicAccess: '--------',
                userAccesses: [
                    {
                        access: 'rw------',
                        name: 'Cloning User',
                        id: ''
                    }
                ],
                userGroupAccesses: [],
            },
            trackedEntityTypes: {
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
            trackedEntityAttributes: {
                publicAccess: '--------',
                userAccesses: [
                    {
                        access: 'rw------',
                        name: 'Cloning User',
                        id: ''
                    }
                ],
                userGroupAccesses: [],
            },
            dataElements_trk: {
                publicAccess: '--------',
                userAccesses: [
                    {
                        access: 'rw------',
                        name: 'Cloning User',
                        id: ''
                    }
                ],
                userGroupAccesses: [],
            },
            optionSets: {
                publicAccess: '--------',
                userAccesses: [
                    {
                        access: 'rw------',
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
            programTemplate: {
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
            programDependencies: {
                programs: true,
                programTrackedEntityAttributes: true,
                prgoramStages: true,
                programStageSections: true,
                programStageDataElements: true,
                programIndicators: true,
                programRules: true,
                trackedEntityTypes: false,
                trackedEntityAttributes: false,
                dataElements: false,
                optionSets: false
            },
            sharingSettings: {
                programs: {
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
                programStages: {
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
                programIndicators: {
                    publicAccess: '--------',
                    userAccesses: [
                        {
                            access: 'rw------',
                            name: 'Cloning User',
                            id: ''
                        }
                    ],
                    userGroupAccesses: [],
                },
                trackedEntityTypes: {
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
                trackedEntityAttributes: {
                    publicAccess: '--------',
                    userAccesses: [
                        {
                            access: 'rw------',
                            name: 'Cloning User',
                            id: ''
                        }
                    ],
                    userGroupAccesses: [],
                },
                dataElements_trk: {
                    publicAccess: '--------',
                    userAccesses: [
                        {
                            access: 'rw------',
                            name: 'Cloning User',
                            id: ''
                        }
                    ],
                    userGroupAccesses: [],
                },
                optionSets: {
                    publicAccess: '--------',
                    userAccesses: [
                        {
                            access: 'rw------',
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
            <PageHeader>Cloning New Programs</PageHeader>
            <div className={classes.form}>
                <FormSection title={'Program information'}>
                    <SingleSelectField
                        required
                        name="program"
                        label={'Program'}
                        placeholder={'Select a program'}
                        onChange={ ({selected}) => {
                            setConfiguration({
                                ...configuration,
                                programTemplate: {
                                    ...configuration.programTemplate,
                                    id: selected
                                }
                            })
                        }}
                        className={classes.singleSelectField}
                        selected={configuration.programTemplate.id}
                        filterable
                        noMatchText="No match found"
                    >
                    {
                        metadata.programs.programs.map( ({id, displayName}) => (
                            <SingleSelectOption 
                                key={id}
                                label={displayName}
                                value={id}
                                active={id === configuration.programTemplate.id}
                            />
                        ))
                    }
                    </SingleSelectField>
                    <InputField
                        required
                        name="prefix"
                        label={'Prefix'}
                        value={configuration.programTemplate.prefix}
                        validate={hasValue}
                        className={classes.textField}
                        onChange={({value}) => {
                            setConfiguration({
                                ...configuration,
                                programTemplate: {
                                    ...configuration.programTemplate,
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
                            value={configuration.programTemplate.fromIdx}
                            validate={hasValue}
                            className={classes.numberField}
                            onChange={({value}) => {
                                setConfiguration({
                                    ...configuration,
                                    programTemplate: {
                                        ...configuration.programTemplate,
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
                            value={configuration.programTemplate.toIdx}
                            validate={hasValue}
                            className={classes.numberField}
                            onChange={({value}) => {
                                setConfiguration({
                                    ...configuration,
                                    programTemplate: {
                                        ...configuration.programTemplate,
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
                        value={configuration.userTemplate.password}
                        type="password"
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
                <FormSection title={'Program dependencies'}>
                    <div className={classes.incolumn}>
                        <CheckboxField
                            name="program"
                            label={'Program'}
                            checked={configuration.programDependencies.programs}
                            disabled
                            className={classes.field}
                        />
                        <CheckboxField
                            name="programTrackedEntityAttributes"
                            label={'Program Tracked Entity Attributes'}
                            checked={configuration.programDependencies.programTrackedEntityAttributes}
                            disabled
                            className={classes.field}
                        />
                        <CheckboxField
                            name="programStages"
                            label={'Program Stages'}
                            checked={configuration.programDependencies.prgoramStages}
                            disabled
                            className={classes.field}
                        />
                        <CheckboxField
                            name="programStageSections"
                            label={'Program Stage Sections'}
                            checked={configuration.programDependencies.programStageSections}
                            disabled
                            className={classes.field}
                        />
                        <CheckboxField
                            name="programStageDataElements"
                            label={'Program Stage Data Elements'}
                            checked={configuration.programDependencies.programStageDataElements}
                            disabled
                            className={classes.field}
                        />
                        <CheckboxField
                            name="programIndicators"
                            label={'Program Indicators'}
                            checked={configuration.programDependencies.programIndicators}
                            disabled
                            className={classes.field}
                        />
                        <CheckboxField
                            name="programRules"
                            label={'Program Rules | Variable | Actions'}
                            checked={configuration.programDependencies.programRules}
                            disabled
                            className={classes.field}
                        />
                        <CheckboxField
                            name="trackedEntityTypes"
                            label={'Tracked Entity Types'}
                            checked={configuration.programDependencies.trackedEntityTypes}
                            className={classes.field}
                            disabled
                        />
                        <CheckboxField
                            name="trackedEntityAttributes"
                            label={'Tracked Entity Attributes'}
                            checked={configuration.programDependencies.trackedEntityAttributes}
                            className={classes.field}
                            onChange={() => {
                                setConfiguration({
                                    ...configuration,
                                    programDependencies: {
                                        ...configuration.programDependencies,
                                        trackedEntityAttributes: !configuration.programDependencies.trackedEntityAttributes,
                                        trackedEntityTypes: !configuration.programDependencies.trackedEntityAttributes,
                                        optionSets: !configuration.programDependencies.dataElements && configuration.programDependencies.trackedEntityAttributes ? false : configuration.programDependencies.optionSets
                                    }
                                })
                            }}
                        />
                        <CheckboxField
                            name="dataElements"
                            label={'Data Elements'}
                            checked={configuration.programDependencies.dataElements}
                            className={classes.field}
                            onChange={() => {
                                setConfiguration({
                                    ...configuration,
                                    programDependencies: {
                                        ...configuration.programDependencies,
                                        dataElements: !configuration.programDependencies.dataElements,
                                        optionSets: configuration.programDependencies.dataElements && !configuration.programDependencies.trackedEntityAttributes ? false : configuration.programDependencies.optionSets
                                    }
                                })
                            }}
                        />
                        <CheckboxField
                            name="optionSets"
                            label={'Options | Option Sets'}
                            checked={configuration.programDependencies.optionSets}
                            className={classes.field}
                            onChange={() => {
                                setConfiguration({
                                    ...configuration,
                                    programDependencies: {
                                        ...configuration.programDependencies,
                                        optionSets: !configuration.programDependencies.optionSets
                                    }
                                })
                            }}
                            disabled={!configuration.programDependencies.dataElements && !configuration.programDependencies.trackedEntityAttributes}
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
                                <DataTableCell>Programs</DataTableCell>
                                <DataTableCell align='right'>
                                <Button
                                    small
                                    secondary
                                    icon={<IconShare16 color={colors.grey600} />}
                                    onClick={() => {
                                        setSharingDialog({
                                            open: true,
                                            metadata: 'programs',
                                            title: "Programs"
                                        })
                                    }}
                                ></Button>
                                </DataTableCell>
                            </DataTableRow>
                            <DataTableRow>
                                <DataTableCell>Program Stages</DataTableCell>
                                <DataTableCell align='right'>
                                <Button
                                    small
                                    secondary
                                    icon={<IconShare16 color={colors.grey600} />}
                                    onClick={() => {
                                        setSharingDialog({
                                            open: true,
                                            metadata: 'programStages',
                                            title: "Program Stages"
                                        })
                                    }}
                                ></Button>
                                </DataTableCell>
                            </DataTableRow>
                            <DataTableRow>
                                <DataTableCell>Program Indicators</DataTableCell>
                                <DataTableCell align='right'>
                                <Button
                                    small
                                    secondary
                                    icon={<IconShare16 color={colors.grey600} />}
                                    onClick={() => {
                                        setSharingDialog({
                                            open: true,
                                            metadata: 'programIndicators',
                                            title: "Program Indicators"
                                        })
                                    }}
                                ></Button>
                                </DataTableCell>
                            </DataTableRow>
                            {configuration.programDependencies.trackedEntityTypes && <DataTableRow>
                                <DataTableCell>Tracked Entity Types</DataTableCell>
                                <DataTableCell align='right'>
                                <Button
                                    small
                                    secondary
                                    icon={<IconShare16 color={colors.grey600} />}
                                    onClick={() => {
                                        setSharingDialog({
                                            open: true,
                                            metadata: 'trackedEntityTypes',
                                            title: "Tracked Entity Types"
                                        })
                                    }}
                                ></Button>
                                </DataTableCell>
                            </DataTableRow>}
                            {configuration.programDependencies.trackedEntityAttributes && <DataTableRow>
                                <DataTableCell>Tracked Entity Attributes</DataTableCell>
                                <DataTableCell align='right'>
                                <Button
                                    small
                                    secondary
                                    icon={<IconShare16 color={colors.grey600} />}
                                    onClick={() => {
                                        setSharingDialog({
                                            open: true,
                                            metadata: 'trackedEntityAttributes',
                                            title: "Tracked Entity Attributes"
                                        })
                                    }}
                                ></Button>
                                </DataTableCell>
                            </DataTableRow>}
                            {configuration.programDependencies.dataElements && <DataTableRow>
                                <DataTableCell>Data Elements</DataTableCell>
                                <DataTableCell align='right'>
                                <Button
                                    small
                                    secondary
                                    icon={<IconShare16 color={colors.grey600} />}
                                    onClick={() => {
                                        setSharingDialog({
                                            open: true,
                                            metadata: 'dataElements_trk',
                                            title: "Data Elements"
                                        })
                                    }}
                                ></Button>
                                </DataTableCell>
                            </DataTableRow>}
                            {configuration.programDependencies.optionSets && <DataTableRow>
                                <DataTableCell>Option Sets</DataTableCell>
                                <DataTableCell align='right'>
                                <Button
                                    small
                                    secondary
                                    icon={<IconShare16 color={colors.grey600} />}
                                    onClick={() => {
                                        setSharingDialog({
                                            open: true,
                                            metadata: 'optionSets',
                                            title: "Option Sets"
                                        })
                                    }}
                                ></Button>
                                </DataTableCell>
                            </DataTableRow>}
                        </DataTableBody>
                    </DataTable>
                </FormSection>
                <ButtonStrip>
                    <Button
                        primary
                        type="submit"
                        onClick={async () => {
                            if ( !configuration.programTemplate.id || !configuration.userTemplate.id || !configuration.programTemplate.prefix || !configuration.userTemplate.password || parseInt(configuration.programTemplate.fromIdx) > parseInt(configuration.programTemplate.toIdx) ) {
                                show({ message: 'Please fill all required fields.' });
                            }
                            else if ( !isValidPassword) {
                                show({ message: 'Password is invalid.' });
                            }
                            else {
                                setProcessing(true);
                                const baseMetadata = await engine.query({
                                    baseProgramMetadata: {
                                        resource: `programs/${configuration.programTemplate.id}/metadata`
                                    },
                                    baseUser: {
                                        resource: 'users',
                                        id: configuration.userTemplate.id,
                                        params: {
                                            fields: [
                                                ":owner",
                                                "!created",
                                                "!lastUpdated",
                                                "!userRoles",
                                                "userCredentials[:owner,!created,!lastUpdated,!lastUpdatedBy,!user,!lastLogin,!passwordLastUpdated]"
                                            ]
                                        }
                                    }
                                });

                                // await doWork(configuration,baseMetadata,engine);
                                let importingData = {
                                    users: []
                                };
                                for (let id = parseInt(configuration.programTemplate.fromIdx); id <= parseInt(configuration.programTemplate.toIdx); id++) {
                                    console.log(`Starting cloning process for user ${id} in instance`);
                            
                                    const password = configuration.userTemplate.password;
                                    const userRoles = configuration.userTemplate.roles;
                            
                                    const user = await cloneUser(`${configuration.programTemplate.prefix}_${id}`,baseMetadata.baseUser,password,userRoles,engine);
                                    const programMetadata = await cloneProgramMetadata(`${configuration.programTemplate.prefix}_${id}`,configuration,baseMetadata.baseProgramMetadata,user.id,engine);
                                    
                                    importingData.users = [
                                        ...importingData.users,
                                        ...[user]
                                    ];
                                    for ( const key in programMetadata ) {
                                        if ( importingData[key] ) {
                                            importingData[key] = [
                                                ...importingData[key],
                                                ...programMetadata[key]
                                            ]
                                        }
                                        else {
                                            importingData[key] = programMetadata[key]
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
                {
                    error.message
                }
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

export default CloningNewProgram;