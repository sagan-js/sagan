export const extend = ({props, collections = {}, derived = {}, reducers = {}, effects}) => {

    class Model extends BaseModel {

        constructor(state) {
            super(state, props, collections, derived, reducers, effects)
        }

        getPropMap() {
            return super.createPropMap(props)
        }

    }

    return Model

}

export const BaseModel = class BaseModel {

    constructor(state, props, collections, derived, reducers, effects) {
        this.state = state

        this.collections = this.initializeCollections(collections)
        this.typeMap = this.createPropMap(props)
        this.checkTypes(this.state, this.typeMap)

        this.derived = this.setDerived(derived)
        this.reducers = this.setReducers(reducers)
        this.effects = effects
    }

    initializeCollections(collections) {
        const collectionInstances = {}
        Object.keys(collections).forEach(key => {
            const state = Object.assign([], this.state[key])
            const collection = new collections[key](state)
            delete this.state[key]
            collectionInstances[key] = collection
        })
        return collectionInstances
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

    checkTypeValidity(type) {
        const typeList = ['string', 'number', 'boolean', 'object', 'array', 'any']
        try {
            if ( !typeList.includes(type) ) {
                throw new Error(`${type}: Invalid prop type.`)
            }
        } catch (e) {
            console.error(`%c ${e}`, 'color: red')
        }
        return type
    }

    createPropMap(props) {
        const map = new Map()

        Object.keys(props).forEach((key) => {

            const propKey = props[key]

            let values = {}

            if (typeof propKey === 'object') {
                values.type = this.checkTypeValidity(propKey.type)

                if ( propKey.hasOwnProperty('required') ) {
                    values.required = propKey.required
                }

                if ( propKey.hasOwnProperty('props') ) {
                    values.props = this.createPropMap(propKey.props)
                }

                if ( propKey.hasOwnProperty('elements') ) {
                    values.elements = typeof propKey.elements === 'object' ? this.createPropMap(propKey.elements) : propKey.elements
                }

            } else {
                values.type = this.checkTypeValidity(propKey)
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

    setCollectionState(state) {
        Object.keys(this.collections).forEach(key => {
            state[key] = this.collections[key].getState()
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
                    const keyType = Array.isArray(obj[key]) ? 'array' : typeof obj[key]
                    if ( keyType !== mapType && mapType !== 'any') {
                        throw new Error(`${key}: Failed prop type of ${keyType}. Expected ${mapType}.`)
                    }
                }
            } catch (e) {
                console.error(`%c ${e}`, 'color: red')
            }
        })
    }

    validateArrayElementType(key, data, typeMap) {
        data.forEach(element => {
            if ( typeof typeMap !== 'object' ) {
                try {
                    const elementType = typeof element
                    if ( elementType !== typeMap && typeMap !== 'any' ) {
                        throw new Error(`${key}: Array failed prop type of ${elementType}. Expected ${typeMap}.`)
                    }
                } catch (e) {
                    console.error(`%c ${e}`, 'color: red')
                }
            } else {
                this.checkTypes(element, typeMap)
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
            if (propData.type === 'array' && propData.elements && obj.hasOwnProperty(key)) {
                this.validateArrayElementType(key, obj[key], propData.elements)
            }
        })

    }

    getBaseState() {
        const state = {
            ...this.state,
            ...this.setCollectionState(Object.assign({}, this.state))
        }
        return state
    }

    getState() {
        const state = {
            ...this.setDerivedState(Object.assign({}, this.state)),
            ...this.setCollectionState(Object.assign({}, this.state))
        }
        return state
    }
}