const auidodevices = (state = [], action) => {
    switch(action.type){
        case "refresh_device":
            let list = []
            for(const dev of action.value){
                if(dev.kind === 'audioinput' && dev.label.indexOf('Microphone') === 0){
                    list = [...list, {text:dev.label, value: dev.deviceId}]
                }
            }
            return list;
        default:
            return [];
    }
}

export default auidodevices;