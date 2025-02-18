import { copy, prefix } from "./utils.js";

// export const doWork = async (configuration,baseMetadata,engine) => {
//     for (let id = parseInt(configuration.dataSetTemplate.fromIdx); id <= parseInt(configuration.dataSetTemplate.toIdx); id++) {
//         // Clone the users
//         console.log(`Starting cloning process for user ${id} in instance`);

//         const password = configuration.userTemplate.password;
//         const userRoles = configuration.userTemplate.roles;

//         const user = await cloneUser(`${configuration.dataSetTemplate.prefix}_${id}`,baseMetadata.baseUser,password,userRoles,engine);

//         const dataSetMetadata = await cloneDataSetMetadata(`${configuration.dataSetTemplate.prefix}_${id}`,configuration,baseMetadata.baseDataSetMetadata,user.id,engine);

//         await engine.mutate({
//             resource: "metadata?importMode=COMMIT",
//             type: "create",
//             data: dataSetMetadata
//         });
//     }
// }

const getIds = async (engine,limit = 1) => {
    const request = await engine.query({
        ids: {
            resource: "system/id",
            params: {
                limit: limit
            }
        }
    });
    return request.ids.codes;
}

export const cloneUser = async (id,baseUser,password,userRoles,engine) => {
    const newIds = (await getIds(engine,2));
    const user = copy(baseUser);
    user.id = newIds[0];
    user.firstName = prefix(id, baseUser.firstName);
    user.userCredentials.id = newIds[1];
    // user.userCredentials.userInfo.id = newIds[0];
    user.userCredentials.username = `${baseUser.username}_${id}`;
    user.userCredentials.password = password;
    user.userCredentials.userRoles = userRoles.map( id => ({ id: id }));

    // await engine.mutate({
    //     resource: "users",
    //     type: "create",
    //     data: user
    // });

    return user;
}   

export const cloneDataSetMetadata = async (id,configuration,baseDataSetMetadata,userId,engine) => {
    const dataSetMetadata = copy(baseDataSetMetadata);

    const dataElementIdMapping = !dataSetMetadata.dataElements ? {} : configuration.dataSetDependencies.dataElements ? await cloneDataElements(id, dataSetMetadata, engine) : dataSetMetadata.dataElements.reduce( (accumulator, currentValue) => {
        return {
            ...accumulator,
            [currentValue.id]: currentValue.id
        }
    }, {});

    // Cloning Custom Data Entry Form
    const dataEntryFormIdMapping = !dataSetMetadata.dataEntryForms ? {} : await cloneDataEntryForms(id, dataSetMetadata, dataElementIdMapping, engine);

    // Cloning Data Set
    const dataSetIdMapping = await cloneDataSets(id, dataSetMetadata, dataElementIdMapping, dataEntryFormIdMapping, engine);

    // Cloning Section
    const dataSetSectionIdMapping = !dataSetMetadata.sections ? {} : await cloneDataSetSections(id, dataSetMetadata, dataElementIdMapping, dataSetIdMapping, engine);
    
    // TO DELETE
    delete dataSetMetadata.system;
    delete dataSetMetadata.date;
    delete dataSetMetadata.options;
    delete dataSetMetadata.optionSets;
    delete dataSetMetadata.categories;
    delete dataSetMetadata.categoryOptions;
    delete dataSetMetadata.categoryCombos;
    delete dataSetMetadata.categoryOptionCombos;

    if ( !configuration.dataSetDependencies.dataElements ) {
        delete dataSetMetadata.dataElements;
    }

    await assignDataSetMetadataSharing(configuration,dataSetMetadata,userId);
    console.log("DONE", dataSetMetadata);

    return dataSetMetadata;
}

const cloneDataElements = async (id, dataSet, engine) => {
    const dataElementSize = dataSet.dataElements.length;
    const newDataElementIds = await getIds(engine,dataElementSize);
    const dataElementIdMapping = {};

    dataSet.dataElements.forEach((dataElement, idx) => {
        const newDataElementId = newDataElementIds[idx];
        dataElementIdMapping[dataElement.id] = newDataElementId;
        dataElement.id = newDataElementId;
        dataElement.formName = dataElement.formName || dataElement.name;
        dataElement.name = prefix(id, dataElement.name);
        dataElement.shortName = prefix(id, dataElement.shortName);
        dataElement.shortName = dataElement.shortName.length > 50 ? prefix(id, newDataElementId) : dataElement.shortName;
        dataElement.code = dataElement.code ? prefix(id, dataElement.code) : null;
    });

    return dataElementIdMapping;
}

const cloneDataEntryForms = async (id, dataSet, dataElementIdMapping, engine) => {
    const dataEntryFormSize = dataSet.dataEntryForms.length;
    const newDataEntryFormIds = await getIds(engine, dataEntryFormSize);
    const dataEntryFormIdMapping = {};

    dataSet.dataEntryForms.forEach((dataEntryForm, idx) => {
        const newDataEntryFormId = newDataEntryFormIds[idx];
        dataEntryFormIdMapping[dataEntryForm.id] = newDataEntryFormId;
        dataEntryForm.id = newDataEntryFormId;
        dataEntryForm.name = prefix(id, dataEntryForm.name);
        dataEntryForm.htmlCode = replaceCustomDataEntrynMappingForDE(dataEntryForm.htmlCode,dataElementIdMapping);
    });

    return dataEntryFormIdMapping;
}

const cloneDataSets = async (id, dataSet, dataElementIdMapping, dataEntryFormIdMapping, engine) => {
    const dataSetSize = dataSet.dataSets.length;
    const newDataSetIds = await getIds(engine, dataSetSize);
    const dataSetIdMapping = {};

    dataSet.dataSets.forEach((dataSet, idx) => {
        const newDataSetId = newDataSetIds[idx];
        dataSetIdMapping[dataSet.id] = newDataSetId;
        dataSet.id = newDataSetId;
        dataSet.name = prefix(id, dataSet.name);
        dataSet.shortName = prefix(id, dataSet.shortName);
        dataSet.shortName = dataSet.shortName.length > 50 ? prefix(id, newDataSetId) : dataSet.shortName;
        dataSet.dataSetElements.forEach( dse => {
            dse.dataSet.id = newDataSetId;
            dse.dataElement.id = dataElementIdMapping[dse.dataElement.id];
        });
        dataSet.code = dataSet.code ? prefix(id, dataSet.code) : null;
        if ( dataSet.dataEntryForm ) {
            dataSet.dataEntryForm.id =  dataEntryFormIdMapping[dataSet.dataEntryForm.id];
        }
    });

    return dataSetIdMapping;
}

const cloneDataSetSections = async (id, dataSet, dataElementIdMapping, dataSetIdMapping, engine) => {
    const dataSetSectionSize = dataSet.sections.length;
    const newDataSetSectionIds = await getIds(engine, dataSetSectionSize);
    const dataSetSectionIdMapping = {};

    dataSet.sections.forEach((section, idx) => {
        const newDataSetSectionId = newDataSetSectionIds[idx];
        dataSetSectionIdMapping[section.id] = newDataSetSectionId;
        section.id = newDataSetSectionId;
        section.name = prefix(id, section.name);
        section.code = section.code ? prefix(id, section.code) : null;
        section.dataElements.forEach( de => {
            de.id = dataElementIdMapping[de.id];
        });
        section.dataSet.id =  dataSetIdMapping[section.dataSet.id];
    });

    return dataSetSectionIdMapping;
}

const replaceCustomDataEntrynMappingForDE = (htmlCode, dataElementIdMapping) => {
    let newHtmlCode = htmlCode;

    for (let oldId in dataElementIdMapping) {
        newHtmlCode = newHtmlCode.replaceAll(oldId, dataElementIdMapping[oldId]);
    }

    return newHtmlCode;
}

const assignDataSetMetadataSharing = async (configuration, dataSetMetadata, userId) => {
    dataSetMetadata.dataSets.forEach( dataSet => {
        for ( const sharing in configuration.sharingSettings.dataSets ) {
            if ( sharing === "userAccesses" ) {
                dataSet["userAccesses"] = configuration.sharingSettings.dataSets.userAccesses.map( userAccess => {
                    if ( userAccess.id === "" ) {
                        return {
                            ...userAccess,
                            id: userId
                        }
                    }
                    else {
                        return userAccess
                    }
                })
            }
            else {
                dataSet[sharing] = configuration.sharingSettings.dataSets[sharing];
            }
        }
    });
    dataSetMetadata.dataElements.forEach( dataElement => {
        for ( const sharing in configuration.sharingSettings.dataElements ) {
            if ( sharing === "userAccesses" ) {
                dataElement["userAccesses"] = configuration.sharingSettings.dataElements.userAccesses.map( userAccess => {
                    if ( userAccess.id === "" ) {
                        return {
                            ...userAccess,
                            id: userId
                        }
                    }
                    else {
                        return userAccess
                    }
                })
            }
            else {
                dataElement[sharing] = configuration.sharingSettings.dataElements[sharing];
            }
        }
    });
}