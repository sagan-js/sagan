import { BaseModel } from './model'

export const extend = ({model, reducers = {}}) => {

    return class Collection {
        constructor(state) {
            this.Model = this.setModel(model)

            this.typeMap = model.prototype.getPropMap()

            this.reducers = this.setReducers(reducers)

            this.setState(state)
        }

        setModel(model) {
            if (typeof model !== 'function') {
                throw new Error('Expected collection model to receive a class function')
            }
            if (!(model.prototype instanceof BaseModel)) {
                throw new Error('Expected collection model to be instance of Sagan model')
            }
            return model
        }

        setReducers(reducers) {
            if (typeof reducers !== 'object' || reducers.constructor === Array) {
                throw new Error('Expected collection reducer to receive an object')
            }

            Object.keys(reducers).forEach((key) => {
                if (typeof reducers[key] !== 'function' ) {
                    throw new Error('Expected collection reducer to be a function')
                }
            })

            return reducers
        }

        addItem(state, payload) {
            return [
                ...state,
                payload
            ]
        }

        removeItem(state, payload) {
            const newArray = state.filter((item, i) => {
                return i !== payload
            })

            return newArray
        }

        setState(state = []) {

            const mappedState = state.map(item => {
                const newModel = new this.Model(item)
                return newModel
            })

            this.state = mappedState.map(item => item.getBaseState())
            this.models = mappedState
        }

        getState() {
            return this.models.map(item => item.getState())
        }

    }
}