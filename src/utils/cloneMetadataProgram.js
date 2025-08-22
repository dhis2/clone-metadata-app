import { 
    copy, 
    prefix, 
    getIds 
} from "./index.js";

// export const doWork = async (configuration,baseMetadata,engine) => {
//     for (let id = parseInt(configuration.programTemplate.fromIdx); id <= parseInt(configuration.programTemplate.toIdx); id++) {
//         // Clone the users
//         console.log(`Starting cloning process for user ${id} in instance`);

//         const password = configuration.userTemplate.password;
//         const userRoles = configuration.userTemplate.roles;

//         const user = await cloneUser(`${configuration.programTemplate.prefix}_${id}`,baseMetadata.baseUser,password,userRoles,engine);

//         const programMetadata = await cloneProgramMetadata(`${configuration.programTemplate.prefix}_${id}`,configuration,baseMetadata.baseProgramMetadata,user.id,engine);

//         console.log(programMetadata);
    
//         await engine.mutate({
//             resource: "metadata?importMode=COMMIT",
//             type: "create",
//             data: programMetadata
//         });
//     }
// }

export const cloneProgramMetadata = async (id,configuration,baseProgramMetadata,userId,engine) => {
    const programMetadata = copy(baseProgramMetadata);

    const optionIdMapping = !programMetadata.options ? {} : configuration.programDependencies.optionSets ? await cloneOptions(id, programMetadata, engine) : programMetadata.options.reduce( (accumulator, currentValue) => {
        return {
            ...accumulator,
            [currentValue.id]: currentValue.id
        }
    }, {});

    const optionSetIdMapping = !programMetadata.optionSets ? {} : configuration.programDependencies.optionSets ? await cloneOptionSets(id, programMetadata, optionIdMapping, engine) : programMetadata.optionSets.reduce( (accumulator, currentValue) => {
        return {
            ...accumulator,
            [currentValue.id]: currentValue.id
        }
    }, {});

    const dataElementIdMapping = !programMetadata.dataElements ? {} : configuration.programDependencies.dataElements ? await cloneDataElements(id, programMetadata, optionSetIdMapping, engine) : programMetadata.dataElements.reduce( (accumulator, currentValue) => {
        return {
            ...accumulator,
            [currentValue.id]: currentValue.id
        }
    }, {});


    const programStageSectionIdMapping = !programMetadata.programStageSections ? {} : await cloneProgramStageSections(id, programMetadata, dataElementIdMapping, engine);

    const programStageIdMapping = !programMetadata.programStages ? {} : await cloneProgramStages(id, programMetadata, dataElementIdMapping, programStageSectionIdMapping, engine);

    const trackedEntityAttributeIdMapping = !programMetadata.trackedEntityAttributes ? {} : configuration.programDependencies.trackedEntityAttributes ? await cloneTrackedEntityAttributes(id, programMetadata, optionSetIdMapping, engine) : programMetadata.trackedEntityAttributes.reduce( (accumulator, currentValue) => {
        return {
            ...accumulator,
            [currentValue.id]: currentValue.id
        }
    }, {});

    const trackedEntityTypeIdMapping = !programMetadata.trackedEntityTypes ? {} : configuration.programDependencies.trackedEntityTypes ? await cloneTrackedEntityTypes(id, programMetadata, trackedEntityAttributeIdMapping, engine) : programMetadata.trackedEntityTypes.reduce( (accumulator, currentValue) => {
        return {
            ...accumulator,
            [currentValue.id]: currentValue.id
        }
    }, {});

    const programSectionIdMapping = !programMetadata.programSections ? {} : await cloneProgramSections(id, programMetadata, trackedEntityAttributeIdMapping, engine);

    const programIdMapping = await cloneProgram(id, programMetadata, trackedEntityAttributeIdMapping, trackedEntityTypeIdMapping, programStageIdMapping, programSectionIdMapping, engine)

    const programIndicatorIdMapping = !programMetadata.programIndicators ? {} : await cloneProgramIndicators(id, programMetadata, programIdMapping, trackedEntityAttributeIdMapping, dataElementIdMapping, programStageIdMapping, engine);

    const programRuleVariableIdMapping = !programMetadata.programRuleVariables ? {} : await cloneProgramRuleVariables(id, programMetadata, programIdMapping, trackedEntityAttributeIdMapping, dataElementIdMapping, programStageIdMapping, engine);
    const programRuleActionIdMapping = !programMetadata.programRuleActions ? {} : await cloneProgramRuleActions(id, programMetadata, trackedEntityAttributeIdMapping, dataElementIdMapping, programStageIdMapping, programStageSectionIdMapping, optionIdMapping, programIndicatorIdMapping, engine);
    const programRuleIdMapping = !programMetadata.programRules ? {} : await cloneProgramRules(id, programMetadata, programIdMapping, programRuleActionIdMapping, engine);
    
    // TO DELETE
    delete programMetadata.system;
    delete programMetadata.date;
    delete programMetadata.programTrackedEntityAttributes;  // As part of program
    delete programMetadata.programStageDataElements;        // As part of programStage
    delete programMetadata.programNotificationTemplates;    // Not needed
    delete programMetadata.categoryOptions;                 // Unmodified
    delete programMetadata.categories;                      // Unmodified
    delete programMetadata.categoryCombos;                  // Unmodified
    delete programMetadata.categoryOptionCombos;            // Unmodified
    delete programMetadata.attributes;                      // Unmodified
    delete programMetadata.legendSets;                      // Unmodified
    delete programMetadata.legends;                         // Unmodified

    if ( !configuration.programDependencies.optionSets ) {
        delete programMetadata.options;
        delete programMetadata.optionSets;
    }
    if ( !configuration.programDependencies.dataElements ) {
        delete programMetadata.dataElements;
    }
    if ( !configuration.programDependencies.trackedEntityAttributes ) {
        delete programMetadata.trackedEntityAttributes;
    }
    if ( !configuration.programDependencies.trackedEntityTypes ) {
        delete programMetadata.trackedEntityTypes;
    }

    await assignProgramMetadataSharing(configuration,programMetadata,userId);

    return programMetadata;
}

const cloneOptions = async (id, program,engine) => {
    const optionsSize = program.options.length;
    const newOptionIds = await getIds(engine,optionsSize);
    const optionIdMapping = {};

    program.options.forEach((option, idx) => {
        const newOptionId = newOptionIds[idx];
        optionIdMapping[option.id] = newOptionId;
        option.id = newOptionId;
        delete option.optionSet;
    });

    return optionIdMapping;
}

const cloneOptionSets = async (id, program, optionIdMapping,engine) => {
    const optionSetsSize = program.optionSets.length;
    const newOptionSetIds = await getIds(engine,optionSetsSize);
    const optionSetIdMapping = {};

    program.optionSets.forEach((optionSet, idx) => {
        const newOptionSetId = newOptionSetIds[idx];
        optionSetIdMapping[optionSet.id] = newOptionSetId;
        optionSet.id = newOptionSetId;
        optionSet.name = prefix(id, optionSet.name);
        optionSet.code = optionSet.code ? prefix(id, optionSet.code) : null;
        optionSet.options.forEach(option => option.id = optionIdMapping[option.id]);
    });

    return optionSetIdMapping;
}

const cloneDataElements = async (id, program, optionSetIdMapping, engine) => {
    const dataElementSize = program.dataElements.length;
    const newDataElementIds = await getIds(engine,dataElementSize);
    const dataElementIdMapping = {};

    program.dataElements.forEach((dataElement, idx) => {
        const newDataElementId = newDataElementIds[idx];
        dataElementIdMapping[dataElement.id] = newDataElementId;
        dataElement.id = newDataElementId;
        dataElement.formName = dataElement.formName || dataElement.name;
        dataElement.name = prefix(id, dataElement.name);
        dataElement.shortName = prefix(id, dataElement.shortName);
        dataElement.shortName = dataElement.shortName.length > 50 ? prefix(id, newDataElementId) : dataElement.shortName;
        dataElement.optionSet = dataElement.optionSet ? {"id": optionSetIdMapping[dataElement.optionSet.id]} : null;
        dataElement.code = dataElement.code ? prefix(id, dataElement.code) : null;
    });

    return dataElementIdMapping;
}

const cloneProgramStageSections = async (id, program, dataElementIdMapping, engine) => {
    const programStageSectionSize = program.programStageSections.length;
    const newIds = await getIds(engine,programStageSectionSize);
    const programStageSectionIdMapping = {};

    if (program.programStageSections) {
        program.programStageSections.forEach((section, idx) => {
            const newSectionId = newIds[idx];
            programStageSectionIdMapping[section.id] = newSectionId;
            section.id = newSectionId;
            section.dataElements.forEach(dataElement => dataElement.id = dataElementIdMapping[dataElement.id]);
            // delete section.programStage;
        });
    }
    

    return programStageSectionIdMapping;
}

const cloneProgramStages = async (id, program, dataElementIdMapping, stageSectionIdMapping, engine) => {
    const stagesSize = program.programStages.length;
    const newStageIds = await getIds(engine,stagesSize);
    const programStageIdMapping = {};

    program.programStages.forEach((stage, idx) => {
        const newStageId = newStageIds[idx];
        programStageIdMapping[stage.id] = newStageId;
        stage.id = newStageId;
        stage.programStageDataElements.forEach((stageDataElement, idx) => {
            delete stageDataElement.id;
            delete stageDataElement.programStage;
            stageDataElement.dataElement.id = dataElementIdMapping[stageDataElement.dataElement.id];
        });
        stage.programStageSections.forEach(stageSection => stageSection.id = stageSectionIdMapping[stageSection.id]);
        delete stage.program;
    });
    if (program.programStageSections) {
        program.programStageSections.forEach((section) => section.programStage.id = programStageIdMapping[section.programStage.id])
    }
    

    return programStageIdMapping;
}

const cloneTrackedEntityAttributes = async (id, program, optionSetIdMapping, engine) => {
    const trackedEntityAttributeSize = program.trackedEntityAttributes.length;
    const newTrackedEntityAttributeIds = await getIds(engine,trackedEntityAttributeSize);
    const trackedEntityAttributeIdMapping = {};

    program.trackedEntityAttributes.forEach((trackedEntityAttribute,idx) => {
        const newTrackedEntityAttributeId = newTrackedEntityAttributeIds[idx];
        trackedEntityAttributeIdMapping[trackedEntityAttribute.id] = newTrackedEntityAttributeId;
        trackedEntityAttribute.id = newTrackedEntityAttributeId;
        trackedEntityAttribute.formName = trackedEntityAttribute.formName || trackedEntityAttribute.name;
        trackedEntityAttribute.name = prefix(id, trackedEntityAttribute.name);
        trackedEntityAttribute.code = trackedEntityAttribute.code ? prefix(id, trackedEntityAttribute.code) : null;
        trackedEntityAttribute.shortName = prefix(id, trackedEntityAttribute.shortName);
        trackedEntityAttribute.shortName = trackedEntityAttribute.shortName.length > 50 ? prefix(id, newTrackedEntityAttributeId) : trackedEntityAttribute.shortName;
        trackedEntityAttribute.optionSet = trackedEntityAttribute.optionSet ? {"id": optionSetIdMapping[trackedEntityAttribute.optionSet.id]} : null;
    });

    return trackedEntityAttributeIdMapping;
}

const cloneTrackedEntityTypes = async (id, program, trackedEntityAttributeIdMapping, engine) => {
    const newTrackedEntityTypeIds = await getIds(engine);
    const trackedEntityTypeIdMapping = {};

    program.trackedEntityTypes.forEach((trackedEntityType,idx) => {
        const newTrackedEntityTypeId = newTrackedEntityTypeIds[idx];
        trackedEntityTypeIdMapping[trackedEntityType.id] = newTrackedEntityTypeId;
        trackedEntityType.id = newTrackedEntityTypeId;
        trackedEntityType.name = prefix(id, trackedEntityType.name);
        trackedEntityType.shortName = prefix(id, trackedEntityType.shortName);
        trackedEntityType.shortName = trackedEntityType.shortName.length > 50 ? prefix(id, newTrackedEntityTypeId) : trackedEntityType.shortName;
        trackedEntityType.trackedEntityTypeAttributes.forEach(attribute => {
            attribute.id = trackedEntityAttributeIdMapping[attribute.id]
        })
    });

    return trackedEntityTypeIdMapping;
}

const cloneProgramSections = async (id, program, trackedEntityAttributeIdMapping, engine) => {
    const programSectionSize = program.programSections.length;
    const newIds = await getIds(engine,programSectionSize);
    const programSectionIdMapping = {};

    if (program.programSections) {
        program.programSections.forEach((section, idx) => {
            const newSectionId = newIds[idx];
            programSectionIdMapping[section.id] = newSectionId;
            section.id = newSectionId;
            section.trackedEntityAttributes.forEach(tea => tea.id = trackedEntityAttributeIdMapping[tea.id]);
            // delete section.program;
        });
    }
    

    return programSectionIdMapping;
}

const cloneProgram = async (id, program, trackedEntityAttributeIdMapping, trackedEntityTypeIdMapping, programStageIdMapping, programSectionIdMapping, engine) => {
    const newIds = await getIds(engine);
    const programIdMapping = {};

    program.programs.forEach( (programm,idx) => {
        const newProgramId = newIds[idx];
        programIdMapping[programm.id] = newProgramId;
        programm.id = newProgramId;
        programm.name = prefix(id, programm.name);
        programm.shortName = prefix(id, programm.shortName);
        programm.shortName = programm.shortName.length > 50 ? prefix(id, newProgramId) : programm.shortName;
        programm.code = programm.code ? prefix(id, programm.code) : null;
        programm.programStages.forEach(stage => stage.id = programStageIdMapping[stage.id]);
        programm.programTrackedEntityAttributes.forEach(programAttribute => {
            delete programAttribute.id;
            delete programAttribute.program;
            programAttribute.trackedEntityAttribute.id = trackedEntityAttributeIdMapping[programAttribute.trackedEntityAttribute.id];
        });
        programm.trackedEntityType.id = trackedEntityTypeIdMapping[programm.trackedEntityType.id];
        if (programm.programSections) {
            programm.programSections.forEach(section => section.id = programSectionIdMapping[section.id]);
        }

        // delete programm.programSections;
        delete programm.notificationTemplates;
    });

    if ( program.programSections ) {
        program.programSections.forEach((section) => section.program.id = programIdMapping[section.program.id]);
    }
    

    return programIdMapping;
}

const cloneProgramIndicators = async (id, program, programIdMapping, trackednEntityAttributeIdMapping, dataElementIdMapping, stageIdMapping, engine) => {
    const programIndicatorsSize = program.programIndicators.length;
    const newProgramIndicatorIds = await getIds(engine, programIndicatorsSize);
    const programIndicatorIdMapping = {};

    const boundariesIds = await getIds(engine,programIndicatorsSize * 4); // Just to be sure we have enough ids in case an indicator has more than 2 boundaries
    let boundaryIdx = 0;

    program.programIndicators.forEach((programIndictor, idx) => {
        const newProgramIndicatorId = newProgramIndicatorIds[idx];
        programIndicatorIdMapping[programIndictor.id] = newProgramIndicatorId;
        programIndictor.id = newProgramIndicatorId;
        programIndictor.program.id = programIdMapping[programIndictor.program.id];
        programIndictor.name = prefix(id, programIndictor.name);
        programIndictor.shortName = prefix(id, programIndictor.shortName);
        programIndictor.shortName = programIndictor.shortName.length > 50 ? prefix(id, newProgramIndicatorId) : programIndictor.shortName;
        delete programIndictor.code;

        programIndictor.analyticsPeriodBoundaries.forEach(boundary => {
            boundary.id = boundariesIds[boundaryIdx++];
        })

        for (let oldId in dataElementIdMapping) {
            programIndictor.expression = replaceExpressionMappingForDE(programIndictor.expression, dataElementIdMapping, stageIdMapping);
            programIndictor.filter = replaceExpressionMappingForDE(programIndictor.filter, dataElementIdMapping, stageIdMapping);
        }

        for (let oldId in trackednEntityAttributeIdMapping) {
            programIndictor.expression = replaceExpressionMappingForTEA(programIndictor.expression, trackednEntityAttributeIdMapping);
            programIndictor.filter = replaceExpressionMappingForTEA(programIndictor.filter, trackednEntityAttributeIdMapping);
        }
    });

    return programIndicatorIdMapping;
}

const replaceExpressionMappingForDE = (expression, dataElementIdMapping, stageIdMapping) => {
    if (expression != null) {
        let newExpression = expression;

        for (let oldId in dataElementIdMapping) {
            newExpression = newExpression.replaceAll(oldId, dataElementIdMapping[oldId]);
        }

        for (let oldId in stageIdMapping) {
            newExpression = newExpression.replaceAll(oldId, stageIdMapping[oldId]);
        }

        return newExpression
    } else {
        return null;
    }
}

const replaceExpressionMappingForTEA = (expression, trackedEntityAttributeIdMapping) => {
    if (expression != null) {
        let newExpression = expression;

        for (let oldId in trackedEntityAttributeIdMapping) {
            newExpression = newExpression.replaceAll(oldId, trackedEntityAttributeIdMapping[oldId]);
        }

        return newExpression
    } else {
        return null;
    }
}

const cloneProgramRuleVariables = async (id, program, programIdMapping, trackedEntityAttributeIdMapping, dataElementIdMapping, stageIdMapping, engine) => {
    const variableSize = program.programRuleVariables.length;
    const newIds = await getIds(engine,variableSize);
    const variableIdMapping = {};

    program.programRuleVariables.forEach((variable, idx) => {
        const newVariableId = newIds[idx];
        variableIdMapping[variable.id] = newVariableId;
        variable.id = newVariableId;
        variable.name = prefix(id, variable.name);
        if (variable.program != null) {
            variable.program = {"id": programIdMapping[variable.program.id]};
        }
        if (variable.programStage != null) {
            variable.programStage = {"id": stageIdMapping[variable.programStage.id]};
        }
        if (variable.dataElement != null) {
            variable.dataElement = {"id": dataElementIdMapping[variable.dataElement.id]};
        }
        if (variable.trackedEntityAttribute != null) {
            variable.trackedEntityAttribute = {"id": trackedEntityAttributeIdMapping[variable.trackedEntityAttribute.id]};
        }
    });

    return variableIdMapping;
}

const cloneProgramRuleActions = async (id, program, trackedEntityAttributeIdMapping, dataElementIdMapping, stageIdMapping, stageSectionIdMapping, optionIdMapping, programIndicatorIdMapping, engine) => {
    const actionsSize = program.programRuleActions.length;
    const newActionsIds = await getIds(engine,actionsSize);
    const actionIdMapping = {};

    program.programRuleActions.forEach((action, idx) => {
        const newActionId = newActionsIds[idx];
        actionIdMapping[action.id] = newActionId;
        action.id = newActionId;
        // action.programRule.id = ruleIdMapping[action.programRule.id]

        if (action.dataElement != null) {
            action.dataElement = {"id": dataElementIdMapping[action.dataElement.id]};
        }
        if (action.programStage != null) {
            action.programStage = {"id": stageIdMapping[action.programStage.id]};
        }
        if (action.programStageSection != null) {
            action.programStageSection = {"id": stageSectionIdMapping[action.programStageSection.id]};
        }
        if (action.option != null) {
            action.option = {"id": optionIdMapping[action.option.id]};
        }
        if (action.trackedEntityAttribute != null) {
            action.trackedEntityAttribute = {"id": trackedEntityAttributeIdMapping[action.trackedEntityAttribute.id]};
        }
        if (action.programIndicator != null) {
            action.programIndicator = {"id": programIndicatorIdMapping[action.programIndicator.id]};
        }
    });

    return actionIdMapping;
}

const cloneProgramRules = async (id, program, programIdMapping, programRuleActionIdMapping, engine) => {
    const rulesSize = program.programRules.length;
    const newIds = await getIds(engine,rulesSize);
    const programRuleIdMapping = {};

    program.programRules.forEach((rule, idx) => {
        const newProgramRuleId = newIds[idx];
        programRuleIdMapping[rule.id] = newProgramRuleId;
        rule.id = newProgramRuleId;
        rule.program.id = programIdMapping[rule.program.id];
        rule.name = prefix(id, rule.name);

        rule.programRuleActions.forEach(action => {
            action.id = programRuleActionIdMapping[action.id];
        })

        // rule.programRuleActions = [];
    });

    program.programRuleActions.forEach((action) => action.programRule.id = programRuleIdMapping[action.programRule.id])

    return programRuleIdMapping;
}

const assignProgramMetadataSharing = async (configuration, programMetadata, userId) => {
    programMetadata.programs.forEach( program => {
        for ( const sharing in configuration.sharingSettings.programs ) {
            if ( sharing === "userAccesses" ) {
                program["userAccesses"] = configuration.sharingSettings.programs.userAccesses.map( userAccess => {
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
                program[sharing] = configuration.sharingSettings.programs[sharing];
            }
        }
    });
    programMetadata.programStages.forEach( programStage => {
        for ( const sharing in configuration.sharingSettings.programStages ) {
            if ( sharing === "userAccesses" ) {
                programStage["userAccesses"] = configuration.sharingSettings.programStages.userAccesses.map( userAccess => {
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
                programStage[sharing] = configuration.sharingSettings.programStages[sharing];
            }
        }
    });
    if ( programMetadata.programIndicators ) {
        programMetadata.programIndicators.forEach( programIndicator => {
            for ( const sharing in configuration.sharingSettings.programIndicators ) {
                if ( sharing === "userAccesses" ) {
                    programIndicator["userAccesses"] = configuration.sharingSettings.programIndicators.userAccesses.map( userAccess => {
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
                    programIndicator[sharing] = configuration.sharingSettings.programIndicators[sharing];
                }
            }
        });
    }
    if ( configuration.programDependencies.trackedEntityTypes ) {
        programMetadata.trackedEntityTypes.forEach( trackedEntityType => {
            for ( const sharing in configuration.sharingSettings.trackedEntityTypes ) {
                if ( sharing === "userAccesses" ) {
                    trackedEntityType["userAccesses"] = configuration.sharingSettings.trackedEntityTypes.userAccesses.map( userAccess => {
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
                    trackedEntityType[sharing] = configuration.sharingSettings.trackedEntityTypes[sharing];
                }
            }
        });
    }
    if ( configuration.programDependencies.trackedEntityAttributes ) {
        programMetadata.trackedEntityAttributes.forEach( trackedEntityAttribute => {
            for ( const sharing in configuration.sharingSettings.trackedEntityAttributes ) {
                if ( sharing === "userAccesses" ) {
                    trackedEntityAttribute["userAccesses"] = configuration.sharingSettings.trackedEntityAttributes.userAccesses.map( userAccess => {
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
                    trackedEntityAttribute[sharing] = configuration.sharingSettings.trackedEntityAttributes[sharing];
                }
            }
        });
    }
    if ( configuration.programDependencies.dataElements ) {
        programMetadata.dataElements.forEach( dataElement => {
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
    if ( configuration.programDependencies.optionSets ) {
        programMetadata.optionSets.forEach( optionSet => {
            for ( const sharing in configuration.sharingSettings.optionSets ) {
                if ( sharing === "userAccesses" ) {
                    optionSet["userAccesses"] = configuration.sharingSettings.optionSets.userAccesses.map( userAccess => {
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
                    optionSet[sharing] = configuration.sharingSettings.optionSets[sharing];
                }
            }
        });
    }
}