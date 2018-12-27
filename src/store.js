import { BaseModel } from './model'

export default class StoreClass {
    constructor({models = {}, middlewares}) {
        this._connectDevTools()
        this.eventListeners = []
        this.state = this.setModels(models)
        this.middlewares = middlewares
    }

    setModels(models) {
        if (typeof models !== 'object' || models.constructor === Array) {
            throw new Error('Expected models to receive an object')
        }

        Object.keys(models).forEach((key) => {
            if (!models[key].Model && !(models[key] instanceof BaseModel)) {
                throw new Error('Expected model to be instance of Sagan model')
            } else if (models[key].Model && !(models[key].Model.prototype instanceof BaseModel)) {
                throw new Error('Expected collection model to be instance of Sagan model')
            }
        })

        return models
    }

    _connectDevTools() {
        this.withDevTools = (
            process.env.NODE_ENV === 'development' &&
            typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__
        )

        if (this.withDevTools) {
            this.devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect()
            this.unsubscribeDevTools = this.devTools.subscribe((message) => {
                if (message.type === 'DISPATCH' && message.payload.type === 'JUMP_TO_ACTION') {
                    this._timeTravel(JSON.parse(message.state))
                }
            })
        }

    }

    _timeTravel(newState) {

        Object.keys(newState).forEach((key) => {
            const context = this.state[key]

            if (!context.Model) {
                Object.keys(newState[key]).forEach((prop) => {
                    if ( !context.typeMap.has(prop) ) {
                        delete newState[key][prop]
                    }
                })
            } else {
                newState[key].forEach((item, i) => {
                    Object.keys(item).forEach((prop) => {
                        if ( !context.typeMap.has(prop) ) {
                            delete newState[key][i][prop]
                        }
                    })
                })
            }

            if ( typeof context['update'] === 'function' ) {
                context.setState(context['update'].call(this, context.state, newState[key]))
            } else {
                context.setState(newState[key])
            }

        })

        this.emit()

    }

    subscribe(fn) {
        if (typeof fn !== 'function') {
            throw new Error('Expected the listener to be a function.')
        }

        this.eventListeners.push(fn)

        return () => {
            this.eventListeners = this.eventListeners.filter(eventFn => fn !== eventFn)
        }
    }

    emit() {
        if ( this.eventListeners.length ) {
            this.eventListeners.forEach(fn => {
             fn.call(null, this.getState())
           })
         }
    }

    getState() {
        const stateObj = {}
        Object.keys(this.state).forEach((key) => {
            stateObj[key] = this.state[key].getState()
        })

        return stateObj
    }

    areEqualShallow(a, b) {
        var key
        for (key in a) {
            if (a[key] !== b[key]) {
                return false
            }
        }
        return true
    }

    applyMiddlewares(context, state, action) {
        if (this.middlewares && this.middlewares.length) {
            this.middlewares.forEach(middleware => middleware.call(context, state, action))
        }
    }

    getReducerContext(type, separator) {
        let { model, reducer } = this.splitPayloadType(type, separator)
        let context = this.state[model]
        if ( reducer.indexOf('|') > -1 ) {
            let { model: collection, reducer: collectionReducer } = this.splitPayloadType(reducer, '|')
            context = context.collections[collection]
            reducer = collectionReducer
        }

        return {context, reducer}
    }

    splitPayloadType(type, separator) {
        const split = type.split(separator)
        const model = split[0]
        const reducer = split[1]
        return {model, reducer}
    }

    /*
    ** Call user reducers on model
    */
    callReducers(context, reducer, payload) {
        if ( context.reducers && context.reducers.hasOwnProperty(reducer) ) {
            context.setState(context.reducers[reducer].call(this, context.state, payload))
        }
    }

    /*
    ** Call inherited base reducers on model
    */
    callBaseReducers(context, reducer, payload) {
        if ( context[reducer] && typeof context[reducer] === 'function' ) {
            context.setState(context[reducer].call(this, context.state, payload))
        }
    }

    /*
    ** Generate list of all model/collection contexts
    */
    generateContextList(contextList, context) {
        Object.keys(context).forEach(model => {
            const currentContext = context[model]
            contextList.push(currentContext)

            if (currentContext.collections && Object.keys(currentContext.collections).length) {
                this.generateContextList(contextList, currentContext.collections)
            }
        })
        return contextList
    }

    dispatch({type, payload}) {

        const oldState = this.getState()

        if (type.indexOf('/') > -1) {
            /*
            ** Call namespaced reducers or reducer on nested collection
            */
            const {context, reducer} = this.getReducerContext(type, '/')
            this.callReducers(context, reducer, payload)

            /*
            ** Call effects
            */
            if (context.effects && context.effects.hasOwnProperty(reducer)) {
                context.effects[reducer].call(this, context.state, payload)
            }
        } else if (type.indexOf(':') > -1) {
            /*
            ** Call base reducers inherited by models
            */
            const {context, reducer} = this.getReducerContext(type, ':')
            this.callBaseReducers(context, reducer, payload)
        } else {
            /*
            ** Call reducers on all model contexts
            */
            const reducer = type
            const contextList = this.generateContextList([], this.state)
            contextList.forEach(context => {
                this.callReducers(context, reducer, payload)
            })
        }

        if (!this.areEqualShallow(oldState, this.getState())) {
            this.applyMiddlewares(this, this.getState(), {type, payload})
            if (this.withDevTools) {
                this.devTools.send(type, this.getState())
            }
            this.emit()
        }

    }
}