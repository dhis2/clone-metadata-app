/**
 * Returns a function, that, as long as it continues to be invoked, will not be triggered. The
 * function will be called after it stops being called for N milliseconds. If `immediate` is
 * passed, trigger the function on the leading edge, instead of the trailing.
 */

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