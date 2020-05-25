import VNode from "../vdom/vnode.js";
import {
    prepareRender,
    getVnodeByTemplate,
    clearMap
} from "./render.js";
import {
    vmodel
} from "./grammer/vmodel.js";
import {
    vforInit
} from "./grammer/vfor.js";
import {
    mergeAttr
} from "../Utils/ObjectUtil.js";
import {
    checkVBind
} from "./grammer/vbind.js";
import {
    checkVOn
} from "./grammer/von.js";
// 另一种挂载的方式 专业 o(￣▽￣)ｄ
export function initMount(Due) {
    Due.prototype.$mount = function (el) {
        let rootDom = document.getElementById(el);
        mount(vm, rootDom);
    }
}

// 挂载
export function mount(vm, elem) {
    // 根节点挂载 没有父级 所以穿空
    vm._vnode = constructVNode(vm, elem, null);
    // 进行预备渲染(建立渲染索引 通过模板找vnode 通过vnode找模板)
    prepareRender(vm, vm._vnode);
}

// 构建虚拟节点
function constructVNode(vm, elem, parent) {

    // 初始化属性值
    // 分析标签身上的属性 例如v-model v-for
    let vnode = analysisAttr(vm, elem, parent);
    // 判断是否是虚拟节点 v-for
    if (vnode == null) {
        let children = [];
        let text = getNodeText(elem);
        let data = null;
        let nodeType = elem.nodeType;
        let tag = elem.nodeName;

        // 创建了一个虚拟节点实例
        vnode = new VNode(tag, elem, children, text, data, parent, nodeType);

        if (elem.nodeType == 1 && elem.getAttribute('env')) {
            vnode.env = mergeAttr(vnode.env, JSON.parse(elem.getAttribute('env')));
        } else {
            vnode.env = mergeAttr(vnode.env, parent ? parent.env : {});
        }
    }

    checkVBind(vm, vnode);
    checkVOn(vm, vnode);
    // 对节点的子节点进行遍历并依次为他们创建虚拟节点实例
    let childs = vnode.nodeType == 0 ? vnode.parent.elem.childNodes : vnode.elem.childNodes;
    let len = vnode.nodeType == 0 ? vnode.parent.elem.childNodes.length : vnode.elem.childNodes.length;
    for (let i = 0; i < len; i++) {
        // 为子节点创建虚拟节点实例
        let childNode = constructVNode(vm, childs[i], vnode);
        // 判断返回的子虚拟节点实例是不是数组
        if (childNode instanceof VNode) {
            // 不是则直接push进去
            vnode.children.push(childNode);
        } else {
            // 是则拼接进去
            vnode.children = vnode.children.concat(childNode);
        }
    }

    return vnode;
}

// 判断节点是否为文本节点 不是则返回空串
function getNodeText(elem) {
    if (elem.nodeType == 3) {
        // 只有文本节点能够返回带有内容的nodeValue 其余返回为null
        return elem.nodeValue;
    } else {
        return '';
    }
}

function analysisAttr(vm, elem, parent) {
    if (elem.nodeType == 1) {
        // 获取elem元素的所有属性名称 例如v-model
        let attrNames = elem.getAttributeNames();
        if (attrNames.indexOf('v-model') > -1) {
            vmodel(vm, elem, elem.getAttribute('v-model'));
        }
        if (attrNames.indexOf('v-for') > -1) {
            return vforInit(vm, elem, parent, elem.getAttribute('v-for'));
        }
    }
}

export function rebuild(vm, template) {
    let virtualNode = getVnodeByTemplate(template);
    for (let i = 0; i < virtualNode.length; i++) {
        virtualNode[i].parent.elem.innerHTML = '';
        virtualNode[i].parent.elem.appendChild(virtualNode[i].elem);
        let result = constructVNode(vm, virtualNode[i].elem, virtualNode[i].parent);
        virtualNode[i].parent.children = [result];
        clearMap();
        prepareRender(vm, vm._vnode);
    }
}