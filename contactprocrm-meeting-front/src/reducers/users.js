const BackColors = [
    '#99EE99E0',
    '#FF88EEE0',
    '#EEFF88E0',
    '#AAAAFFE0',
    '#DD9999E0',
    '#DDFFDDE0',
    '#88FFDDE0',
    '#DDDDFFE0',
    '#FFDDDDE0',
    '#CEECEEE0',
    '#FFEEDDE0',
    '#eeeeeeE0',
    '#cceeeeE0',
    '#eecceeE0',
    '#eeeeccE0',
    '#cccceeE0',
    '#eeccccE0',
    '#cceeccE0'
]
export let UserColors = {}
function assignColor(){
    let colors = BackColors;
    for(const ele in UserColors) {
        colors = colors.filter((clr)=> clr !== UserColors[ele])
    }
    return colors[0];
}
const users = (state = [], action) => {
    switch(action.type){
        case "user_add":
            if( state.find((user)=>user.id === action.value.id)){
                console.log('Duplicate user error!')
                return state;
            }
            const color = assignColor();
            UserColors[action.value.id] = color;
            return [
                ...state,
                { ...action.value, color, media: {mic:'on', camera:'on'}}
            ]
        case "user_remove":
            delete UserColors[action.value.id];
            return state.filter((user)=>user.id !== action.value.id);
        case "user_media":
            return state.map((user) => {
                if (user.id !== action.value.id)
                    return user;
                if (action.value.type === 'mic')
                    return {...user, media:{...user.media, mic: action.value.status}}
                return {...user, media:{...user.media, camera: action.value.status}}
            });
        default:
            return state
    }
}
export default users;