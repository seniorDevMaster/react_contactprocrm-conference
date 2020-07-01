import {combineReducers} from 'redux'
import buttons from './buttons'
import users from './users'
import chats from './chats'
// import mediadevices from './medias'

const rootReducer = combineReducers({
    buttons,
    users,
    chats
})

export default rootReducer