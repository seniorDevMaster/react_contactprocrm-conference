const videodevices = (state = [], action) => {
    switch(action.type){
        case "refresh_device":
            let list = []
            console.log(action.value);
            for(const dev of action.value){
                if(dev.kind === 'videoinput' && dev.label.indexOf('screen') === -1){
                    list = [...list, {text:dev.label, value: dev.deviceId}]
                }
            }
            return list;
        default:
            return [];
    }
}

export default videodevices;