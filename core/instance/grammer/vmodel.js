import {
    setValue
} from "../../Utils/ObjectUtil.js"

export function vmodel(vm, elem, data) {

    elem.onchange = function (e) {
        // data为要绑定的属性值的名字 
        setValue(vm, data, elem.value);
    }
}