import './index.css';

class Dialog{
    static show(id) {
        const ele = window.$('#'+id);
        console.log(ele);
        // ele[0].innerHTML = child;
        ele.plainModal('open')
    }
}
export default Dialog;