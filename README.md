# Sagan

Sagan is a type checking state container for JavaScript apps.

It provides consistant state behavior, type checking for models, universal (client, server) applicability, and easy testing and time traveling debugging.

You can use Sagan together with React or with any other view library.

## Influences
Sagan is based on learnings from Redux/Rematch and Backbone.js Even if you haven't used either, Sagan only takes a few minutes to get started with.

### Installation
```
npm install --save sagan
```

The Sagan source code is written in ES2015 but we precompile both CommonJS and UMD builds to ES5 so they work in any modern browser. You don't need to use Babel or a module bundler to get started with Redux.

Most commonly, people consume Sagan as a collection of CommonJS modules. These modules are what you get when you import redux in a Webpack, Browserify, or a Node environment.

If you don't use a module bundler, it's also fine. The `sagan` npm package includes precompiled production and development UMD builds in the dist folder. 

### Complementary Packages
Most likely, you'll also need the Sagan bindinds and the developer tools.

```
npm install --save react-sagan
npm install --save-dev redux-devtools
```

## Overview
Sagan borrows the idea of state immutibility from `React` and combines it with the power of typed models and collections that are very similar in application to `Backbone.js` or `Ampersand.js` Additionaly, Sagan borrows the concept of `reducers` from React for those that desire to follow that paradigm, but is is not actually necessary for updating state as we shall see in our examples.

## Getting Started

### Models
Models bring together state, derived state, and reducers in one place. The model is also responsible for type checking your data.

**model.js**
```javascript
import { extendModel } from 'sagan'

const User = extendModel({
    props: {
        firstName: {
            type: 'string',
            required: true
        },
        lastName: 'string',
        address: {
            type: 'object',
            required: false,
            props: {
                street: 'string',
                city: 'string'
            }
        }
    },
    derived: {
        fullName: {
            deps: ['firstName', 'lastName'],
            fn: function () {
                return this.state.firstName + ' ' + this.state.lastName
            }
        }
    },
    reducers: {
        setFirstName: function(state, payload) {
            return {
                ...state,
                firstName: payload
            }
        },
        setLastName: function(state, payload) {
            return {
                ...state,
                lastName: payload
            }
        },
        setName: function(state, payload) {
            return {
                ...state,
                ...payload
            }
        }
    }
})

export default User
```

#### Props
The props object is where you define type data for your model. Types may be defined by either passing the type as a string, or by passing a type object. They type object allows you to specify additional requirements and well as create nested typed objects.

```javascript
props: {
        firstName: {
            type: 'string',
            required: true
        },
        lastName: 'string',
        address: {
            type: 'object',
            required: false,
            props: {
                street: 'string',
                city: 'string'
            }
        },
        contacts: {
            type: 'array',
            required: false,
            elements: {
                street: 'string',
                city: 'string'
            }
        },
        phoneNumbers: {
            type: 'array',
            required: false,
            elements: 'string'
        }
    },
```

##### Type Object
```javascript
{
    type: ['string', 'boolean', 'number', 'object', 'array', 'any'],
    required: [boolean] (optional),
    props: [type object] (optional),
    elements: [type object, 'string', 'boolean', 'number', 'array', 'any'] (optional)
}
```

`type`: Objects may recieve a type of a `string`, `boolean`, `number`, `object`, `array`, or `any`. 

`requred`: (optional) Props may be specified as required. The default is `false`. Props that are typed directly without a type object default to `false`

`props`: (optional) The props option is reserved to props that are typed as an `object`. This option allows you to type nested props.

`elements`: (optional) The elements option is reserved to props that are typed as an `array`. This option allows you to type array elements.

#### Derived Props
Sagan allows you to specify derived props. These are updated when their prop dependencies update.

```javascript
derived: {
        fullName: {
            deps: ['firstName', 'lastName'],
            fn: function () {
                return this.state.firstName + ' ' + this.state.lastName
            }
        }
    },
```

`deps`: Specify the props this derived prop is dependent on. This prop will throw an error if a dependent prop is missing.

`fn`: The return function that generates the derived prop.

#### Reducers
Similarily to Redux, you may specify reducers for updating state for your model. However, it is not necessary to do so as a helper `update` function is exposed that can be used in the majority of cases. We will go over this in the `Updating State` section.

```javascript
reducers: {
    setFirstName: function(state, payload) {
        return {
            ...state,
            firstName: payload
        }
    }
}
```

### Collections
Collections are objects that allow you to organize and type check groups of models.

```javascript
import { extendCollection} from 'sagan'
import User from 'user.model'

const UserCollection = extendCollection({
    model: User,
    reducers: {
        addUser: function(state, payload) {
            return [
                ...state,
                payload
            ]
        },
        removeUser: function(state, payload) {

            const newArray = state.filter((item, i) => {
                return i !== payload
            })

            return newArray
        }
    }
})

export default UserCollection
```

#### Model
Specify the model that you would like the collection to inherit its typings from.

#### Reducers
Like models, collections allow you to create reducers for the collection as a whole. Depending on the use case, this may not be necesarry as the collection object exposes `addItem` and `removeItem` as helper methods.

### Store - Bringing it all together

**Store** configures your reducers, devtools and middlewares.

**index.js**
```javascript
import { Store, middleware } from 'sagan'
import User from 'user.model'
import UserCollection from 'user.collection'

const userInstance = new User({
    firstName: 'Trooper',
    lastName: 'TK-421',
    address: {
        street: '203 Trash Compactor Lane',
        city: 'Death Star'
    }
})

const UserCollectionInstance = new UserCollection([
    {
        firstName: 'Darth',
        lastName: 'Vader'
    },
    {
        firstName: 'Luke',
        lastName: 'Skywalker'
    }
])

const store = new Store({
    models: {
        user: userInstance,
        users: UserCollectionInstance
    },
    middlewares: [middleware.logger]
})

export default store
```

#### Middleware
You may use middleware with Sagan that pass `state` and `action` as arguments. It will be called after state has been updated. Sagan comes with an importable logger middleware by default. 

```javascript
export default function(state, action) {
    console.log(`${action.type} - dispatched`, state)
}
```

### Updating State
The driving principle underlying Sagan is ease of dispatching actions and updating state. In fact, there are several ways of doing so depending on your need

Here is a basic example of dispatching a `namespaced` payload to a reducer. Let's break down the action type `user/firstName`. In this case `user` is the model we want to specifically dispatch the action to, and `firstname` is the `reducer` we would like trigger. 

```
store.dispatch({type: 'user/firstName', payload: {firstName: 'Darth'}})
```

The same action may also be dispatched without a `namespace` specified. Unlike the first example. An action without a namespace will attempt to trigger the `firstName` reducer on all models and collections in the store. This is useful if you need to trigger updates on multiple points across the store.

```
store.dispatch({type: 'firstName', payload: {firstName: 'Darth'}})
```

#### Models
Models inherit an `update` method that ***must*** be namespaced when used. Take the following as an example. Here we are dispatching the `update` method to the `user` namespace (model). This method will attempt to merge the previous model's state with the passed payload.

```javascript
store.dispatch({type: 'user:update', payload: {firstName: 'Lea', lastName: 'Organa'}})
```

#### Collections
Collections inherit `addItem` and `removeItem` as methods. They are namespaced and used in the same manner as the model methods.

The following will add a new user to the `users` collection.

```javascript
store.dispatch({type: 'users:addItem', payload: {firstName: 'Lea', lastName: 'Organa'}})
```

This example will remove a user at the following index.

```javascript
store.dispatch({type: 'users:removeItem', payload: 1)
```

#### Nested Collections
Dispatching an action to a collection nested within a model requires piping the collection namespace to the reducer you wish to trigger. This may be done with user defined or inherited reducers.

**Note:** Due to possible action/reducer recursion on nested collection models, it is currently not possible to dispatch actions beyond single layer model/collection nestings. 

The following will dispatch the addAddress action to the addresses collection on the user model. `[model]/[collection]|[reducer]`

```
store.dispatch({type: 'user/addresses|addAddress', payload: {city: 'Mos Eisley'}})
```

This example achieves the same end result, but instead uses the inherited `addItem` action.
```
store.dispatch({type: 'user:addresses|addItem', payload: {city: 'Mos Eisley'}})
```

### Listening to Updates
Normally you'd want to use a view binding library (e.g. Sagan Redux) rather than subscribe(). However, it can be handy to have direct acces.

```
store.subscribe((state) => {
    console.log(state)
})
```