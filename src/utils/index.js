/**
 * Returns a function, that, as long as it continues to be invoked, will not be triggered. The
 * function will be called after it stops being called for N milliseconds. If `immediate` is
 * passed, trigger the function on the leading edge, instead of the trailing.
 */
export const prefix = (idx, str) => {
    return `[${idx}] ${str}`;
}

export const copy = (object) => {
    return JSON.parse(JSON.stringify(object));
}

export const debounce = (func, wait, immediate) => {
    let timeout

    return (...args) => {
        const context = this

        const later = () => {
            timeout = null

            if (!immediate) {
                func.apply(context, args)
            }
        }

        const callNow = immediate && !timeout

        clearTimeout(timeout)
        timeout = setTimeout(later, wait)

        if (callNow) {
            func.apply(context, args)
        }
    }
}

export const convertConstantToAccess = (constant) => {
    if ( constant.metadata === 'ACCESS_NONE_METADATA' && constant.data === "ACCESS_NONE_DATA" ) {
        return '--------';
    }
    if ( constant.metadata === 'ACCESS_VIEW_METADATA' && constant.data === "ACCESS_NONE_DATA" ) {
        return 'r-------';
    }
    if ( constant.metadata === 'ACCESS_VIEW_METADATA' && constant.data === "ACCESS_VIEW_DATA" ) {
        return 'r-r-----';
    }
    if ( constant.metadata === 'ACCESS_VIEW_METADATA' && constant.data === "ACCESS_VIEW_AND_EDIT_DATA" ) {
        return 'r-rw----';
    }
    if ( constant.metadata === 'ACCESS_VIEW_AND_EDIT_METADATA' && constant.data === "ACCESS_NONE_DATA" ) {
        return 'rw------';
    }
    if ( constant.metadata === 'ACCESS_VIEW_AND_EDIT_METADATA' && constant.data === "ACCESS_VIEW_DATA" ) {
        return 'rwr-----';
    }
    if ( constant.metadata === 'ACCESS_VIEW_AND_EDIT_METADATA' && constant.data === "ACCESS_VIEW_AND_EDIT_DATA" ) {
        return 'rwrw----';
    }
    return '--------';
}

export const convertAccessToConstant = (access) => {
    if ( access === '--------' ) {
        return {
            metadata: 'ACCESS_NONE_METADATA',
            data: 'ACCESS_NONE_DATA'
        }
    }
    if ( access === 'r-------' ) {
        return {
            metadata: 'ACCESS_VIEW_METADATA',
            data: 'ACCESS_NONE_DATA'
        }
    }
    if ( access === 'r-r-----' ) {
        return {
            metadata: 'ACCESS_VIEW_METADATA',
            data: 'ACCESS_VIEW_DATA'
        }
    }
    if ( access === 'r-rw----' ) {
        return {
            metadata: 'ACCESS_VIEW_METADATA',
            data: 'ACCESS_VIEW_AND_EDIT_DATA'
        }
    }
    if ( access === 'rw------' ) {
        return {
            metadata: 'ACCESS_VIEW_AND_EDIT_METADATA',
            data: 'ACCESS_NONE_DATA'
        }
    }
    if ( access === 'rwr-----' ) {
        return {
            metadata: 'ACCESS_VIEW_AND_EDIT_METADATA',
            data: 'ACCESS_VIEW_DATA'
        }
    }
    if ( access === 'rwrw----' ) {
        return {
            metadata: 'ACCESS_VIEW_AND_EDIT_METADATA',
            data: 'ACCESS_VIEW_AND_EDIT_DATA'
        }
    }
    return {
        metadata: 'ACCESS_NONE_METADATA',
        data: 'ACCESS_NONE_DATA'
    };
}

export const getIds = async (engine,limit = 1) => {
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
    if ( user.userCredentials ) {
        user.userCredentials.id = newIds[1];
        // user.userCredentials.userInfo.id = newIds[0];
        user.userCredentials.username = `${baseUser.username}_${id}`;
        user.userCredentials.password = password;
        user.userCredentials.userRoles = userRoles.map( id => ({ id: id }));
    }
    else {
        user.username = `${baseUser.username}_${id}`;
        user.password = password;
        user.userRoles = userRoles.map( id => ({ id: id }));
    }
    

    // await engine.mutate({
    //     resource: "users",
    //     type: "create",
    //     data: user
    // });

    return user;
}

export const checkValidPassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]).{8,72}$/;
    return re.test(password);
}