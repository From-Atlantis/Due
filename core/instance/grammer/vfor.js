import VNode from "../../vdom/vnode.js";
import {
    getValue
} from "../../Utils/ObjectUtil.js";

// instructions代表的是v-for的内容 例如 key in list
export function vforInit(vm, elem, parent, instructions) {
    // 创建一个虚拟的节点 并将nodeType初始化为0 表示虚拟
    let virtualNode = new VNode(elem.nodeName, elem, [], '', getVirtualNodeData(instructions)[2], parent, 0);
    // 移除虚拟节点
    parent.elem.removeChild(elem);
    // 因为移除虚拟节点的时候会移除虚拟节点后的一个空的文本节点 所以我们再给他加上
    parent.elem.appendChild(document.createTextNode(''));
    // 分析v-for后的指令
    let resultSet = analysisInstructions(vm, instructions, elem, parent);
    return virtualNode;
}

// 用于获取所遍历的数据名 例如 key in list 中的 list
function getVirtualNodeData(instructions) {
    let insSet = instructions.trim().split(' ');
    if (insSet.length != 3 || insSet[1] != 'in' && insSet[1] != 'of') {
        throw new Error('error');
    }
    return insSet;
}

// 分析v-for后的指令
function analysisInstructions(vm, instructions, elem, parent) {
    let insSet = getVirtualNodeData(instructions);
    // 取到遍历的属性在data中的值
    let dataSet = getValue(vm._data, insSet[2]);
    if (!dataSet) {
        throw new Error('error');
    }
    let resultSet = [];
    for (let i = 0; i < dataSet.length; i++) {
        let tempDom = document.createElement(elem.nodeName);
        tempDom.innerHTML = elem.innerHTML;
        let env = analysisKV(insSet[0], dataSet[i], i);
        tempDom.setAttribute('env', JSON.stringify(env));
        parent.elem.appendChild(tempDom);
        resultSet.push(tempDom);
    }
    return resultSet;
}

function analysisKV(instructions, value, index) {
    if (/([a-zA-Z0-9_$]+)/.test(instructions)) {
        instructions = instructions.trim();
        // 去除key的括号 (key) in list
        instructions = instructions.substring(1, instructions.length - 1);
    }
    let keys = instructions.split(',');
    if (keys.length == 0) {
        throw new Error('error');
    }
    let obj = {};
    if (keys.length >= 1) {
        obj[keys[0].trim()] = value;
    }
    if (keys.length >= 2) {
        obj[keys[1].trim()] = index;
    }
    return obj;
}