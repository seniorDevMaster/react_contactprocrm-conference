import { UserColors } from './users'
const chats = (state = [], action) => {
    switch(action.type){
        case "chat_add":
            // scroll
            setTimeout(()=>{
                    const messages = document.getElementsByClassName('chatitemparent');
                    if (messages.length>0) {
                        messages[messages.length-1].scrollIntoView({behavior: 'smooth'});
                    }
                }, 200);
            return [
                ...state,
                { ...action.value, key: state.length, color: UserColors[action.value.userid]}
            ]
        default:
            return state
    }
}

export default chats;