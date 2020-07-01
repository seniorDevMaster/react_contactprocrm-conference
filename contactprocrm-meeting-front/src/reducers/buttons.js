const buttons = (state = {chat:'on', camera:'on', fullscreen:'on', mic: 'on'}, action) => {
    switch(action.type){
        case "click_chat":
            return {
                ...state,
                chat: action.value
            }
        case "click_camera":
            return {
                ...state,
                camera: action.value
            }
        case "click_fullscreen":
            return {
                ...state,
                fullscreen: action.value
            }
        case "click_mic":
            return {
                ...state,
                mic: action.value
            }
        default:
            return state
    }
}

export default buttons;