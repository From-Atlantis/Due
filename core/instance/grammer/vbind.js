import {
    getValue,
    getEnvAttr
} from "../../Utils/ObjectUtil.js";
import {
    generateCode,
    isTrue
} from "../../Utils/code.js";

export function checkVBind(vm, vnode) {
    if (vnode.nodeType != 1) {
        return;
    }
    let attrNames = vnode.elem.getAttributeNames();
    for (let i = 0; i < attrNames.length; i++) {
        if (attrNames[i].indexOf('v-bind') == 0 || attrNames[i].indexOf(':') == 0) {
            vBind(vm, vnode, attrNames[i], vnode.elem.getAttribute(attrNames[i]));
        }
    }
}

function vBind(vm, vnode, name, value) {
    let k = name.split(':')[1];
    if (/^{[\w\W]+}$/.test(value)) {
        let str = value.substring(1, value.length - 1).trim();
        let expressionList = str.split(',');
        let result = analysisExpression(vm, vnode, expressionList);
        console.log(result);
        vnode.elem.setAttribute(k, result);
    } else {
        let v = getValue(vm._data, value);
        vnode.elem.setAttribute(k, v);
    }
}

function analysisExpression(vm, vnode, expressionList) {
    // 获取当前环境的变量
    let attr = getEnvAttr(vm, vnode);
    // 判断表达式是否成立
    let envCode = generateCode(attr);
    // 拼组attr
    let result = '';
    for (let i = 0; i < expressionList.length; i++) {
        let site = expressionList[i].indexOf(':');
        if (site > -1) {
            let code = expressionList[i].substring(site + 1, expressionList[i].length);
            if (isTrue(code, envCode)) {
                result += expressionList[i].substring(0, site) + ',';

            }
        } else {
            result += expressionList[i] + ',';
        }
    }
    if (result.length > 0) {
        result = result.substring(0, result.length - 1);
    }
    return result;
}