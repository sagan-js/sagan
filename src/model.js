export const extend = ({props, derived = {}, reducers = {}, effects}) => {

    class Model extends BaseModel {

        constructor(state) {
            super(state, props, derived, reducers, effects)
        }

        getPropMap() {
            return super.createPropMap(props)
        }

    }

    return Model

}

export const BaseModel = class BaseModel {

    constructor(state, props, derived, reducers, effects) {
        this.state = state

        this.typeMap = this.createPropMap(props)
        this.checkTypes(this.state, this.typeMap)

        this.derived = this.setDerived(derived)
        this.reducers = this.setReducers(reducers)
        this.effects = effects
    }

    setReducers(reducers) {

        if (typeof reducers !== 'object' || reducers.constructor === Array) {
            throw new Error('Expected reducers to receive an object')
        }

        Object.keys(reducers).forEach((key) => {
            if (typeof reducers[key] !== 'function' ) {
                throw new Error('Expected reducer to be a function')
            }
        })

        return reducers
    }

    setDerived(derived) {

        if (typeof derived !== 'object' || derived.constructor === Array) {
            throw new Error('Expected derived props to receive an object')
        }

        Object.keys(derived).forEach((key) => {
            if (typeof derived[key] !== 'object' ) {
                throw new Error('Expected derived prop to be an object')
            }
            if (derived[key].deps.constructor !== Array ) {
                throw new Error('Expected derived prop dependency list to be an array')
            }
            if (typeof derived[key].fn !== 'function' ) {
                throw new Error('Expected derived prop return function to be a function')
            }
        })

        return derived

    }

    createPropMap(props) {
        const map = new Map()

        Object.keys(props).forEach((key) => {

            const propKey = props[key]

            let values = {}

            if (typeof propKey === 'object') {
                values.type = propKey.type

                if ( propKey.hasOwnProperty('required') ) {
                    values.required = propKey.required
                }

                if ( propKey.hasOwnProperty('props') ) {
                    values.props = this.createPropMap(propKey.props)
                }

            } else {
                values.type = propKey
            }

            map.set(key, values)
        })

        return map
    }

    update(state, payload) {
        return {
            ...state,
            ...payload
        }
    }

    setState(state) {
        this.checkTypes(state)
        this.state = state
    }

    checkDerivedDeps(derivedProp, deps) {
        deps.forEach(dep => {
            try {
                if (!this.state.hasOwnProperty(dep)) {
                    throw new Error(`${derivedProp}: Missing dep ${dep}.`)
                }
            } catch (e) {
                console.error(`%c ${e}`, 'color: red')
            }
        })
    }

    setDerivedState(state) {
        Object.keys(this.derived).forEach(key => {
            this.checkDerivedDeps(key, this.derived[key].deps)
            state[key] = this.derived[key].fn.call(this)
        })
        return state
    }

    validateProps(obj, typeMap) {
        Object.keys(obj).forEach((key) => {
            try {
                if ( !typeMap.has(key) ) {
                    throw new Error(`${key}: Unexpected prop.`)
                } else {
                    const mapType = typeMap.get(key).type
                    if (typeof obj[key] !== mapType && mapType !== 'any') {
                        throw new Error(`${key}: Failed prop type of ${typeof obj[key]}. Expected ${mapType}.`)
                    }
                }
            } catch (e) {
                console.error(`%c ${e}`, 'color: red')
            }
        })
    }

    checkIsRequired(obj, typeMap) {

        const keys = Array.from( typeMap.keys() )

        keys.forEach(key => {
            try {
                if (!obj.hasOwnProperty(key) && typeMap.get(key).required) {
                    throw new Error(`${key}: is a required prop. Returned undefined.`)
                }
            } catch (e) {
                console.error(`%c ${e}`, 'color: red')
            }

        })

    }

    checkTypes(obj, typeMap = this.typeMap) {

        const keys = Array.from( typeMap.keys() )

        this.validateProps(obj, typeMap)
        this.checkIsRequired(obj, typeMap)

        keys.forEach(key => {
            const propData = typeMap.get(key)
            if (propData.type === 'object' && propData.props && obj.hasOwnProperty(key)) {
                this.checkTypes(obj[key], propData.props)
            }
        })

    }

    getBaseState() {
        return Object.assign({}, this.state)
    }

    getState() {
        return this.setDerivedState(Object.assign({}, this.state))
    }
}