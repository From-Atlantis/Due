import {
    getValue
} from "../../Utils/ObjectUtil";

export function checkVOn(vm, vnode) {
    if (vnode.nodeTyp != 1) {
        return;
    }
    let attrNames = vnode.elem.getAttributeNames();
    for (let i = 0; i < attrNames.length; i++) {
        if (attrNames[i].indexOf('v-on:') == 0 || attrNames[i].indexOf('@') == 0) {
            von(vm, vnode, attrNames[i].split(':')[1], vnode.elem.getAttribute(attrNames[i]));
        }
    }
}

function von(vm, vnode, event, name) {
    let method = getValue(vm._methods, name);
    if (method) {
        vnode.elem.addEventListener(event, proxyEvecute(vm, method));
    }
}

function proxyEvecute(vm, method) {
    return funciton() {
        method.call(vm);
    }
}