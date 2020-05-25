import {
    getValue
} from "../Utils/ObjectUtil.js";

// 通过模板 查找哪些节点使用了这个模板
let template2VNode = new Map();
// 通过节点 查找这个节点下有哪些模板
let VNode2Template = new Map();

export function renderMixin(Due) {
    Due.prototype._render = function () {
        renderNode(this, this._vnode);
    }
}

// 通过模板查找有哪些节点使用了这个模板
export function renderData(vm, data) {
    let vnodes = template2VNode.get(data);
    if (vnodes != null) {
        for (let i = 0; i < vnodes.length; i++) {
            // 对于使用了这些模板的节点 进行渲染
            renderNode(vm, vnodes[i]);
        }
    }
}

// 渲染根节点内及根节点下的所有模板
export function renderNode(vm, vnode) {
    // 判断是否是文本节点 因为只有文本节点才会有对应的
    if (vnode.nodeType == 3) {
        // 拿到这个文本节点下的所有模板
        let templates = VNode2Template.get(vnode);
        // 判断是否为空
        if (templates) {
            let result = vnode.text;
            for (let i = 0; i < templates.length; i++) {
                let templateValue = getTemplateValue([vm._data, vnode.env], templates[i]);
                if (templateValue) {
                    result = result.replace('{{' + templates[i] + '}}', templateValue);
                }
            }
            vnode.elem.nodeValue = result;
        }
    } else if (vnode.nodeType == 1 && vnode.tag == 'INPUT') {
        let templates = VNode2Template.get(vnode);
        if (templates) {
            for (let i = 0; i < templates.length; i++) {
                let templateValue = getTemplateValue([vm._data, vnode.env], templates[i]);
                if (templateValue) {
                    vnode.elem.value = templateValue;
                }
            }
        }
    } else {
        for (let i = 0; i < vnode.children.length; i++) {
            renderNode(vm, vnode.children[i]);
        }
    }
}

export function prepareRender(vm, vnode) {
    // 如果虚拟节点为null 则直接返回
    if (vnode == null) {
        return;
    }

    //如果虚拟节点为文本节点 则进行文本分析 找出里面的{{}}
    if (vnode.nodeType == 3) {
        analysisTemplateString(vnode);
    }
    if (vnode.nodeType == 0) {
        setTemplate2VNode(vnode.data, vnode);
        setVNode2Template(vnode.data, vnode);
    }
    analysisAttr(vm, vnode);
    // 如果虚拟节点为标签 则对此虚拟节点的子节点进行遍历再分析
    for (let i = 0; i < vnode.children.length; i++) {
        prepareRender(vm, vnode.children[i]);
    }
}

function analysisTemplateString(vnode) {
    // 通过正则查找所有的{{}}
    let templateStrList = vnode.text.match(/{{[a-zA-Z0-9_.]+}}/g);
    // 对匹配到的模板字符串进行遍历 注意判断是否为null 然后对每个模板和当前节点进行处理
    for (let i = 0; templateStrList && i < templateStrList.length; i++) {
        setTemplate2VNode(templateStrList[i], vnode);
        setVNode2Template(templateStrList[i], vnode);
    }
}

function setTemplate2VNode(template, vnode) {
    // 获取模板名字
    let templateName = getTemplateName(template);
    // 看看有没有这个对应的模板
    let vnodeSet = template2VNode.get(templateName);
    // 如果有则将新的虚拟节点放进去
    if (vnodeSet) {
        vnodeSet.push(vnode);
    } else {
        // 如果没有则创建一个新的 值为数组 并将当前的虚拟节点放入
        template2VNode.set(templateName, [vnode]);
    }
}

function setVNode2Template(template, vnode) {
    // 查看是否有对应节点
    let templateSet = VNode2Template.get(vnode);
    // 如果有则放入新的模板
    if (templateSet) {
        templateSet.push(getTemplateName(template));
    } else {
        // 没有则创建一个新的 值依旧为数组 将当前模板放入
        VNode2Template.set(vnode, [getTemplateName(template)]);
    }
}

// 获取模板名字
function getTemplateName(template) {
    // 判断是否有花括号{{}} 有则去除 并返回 没有则直接返回
    if (template.substring(0, 2) == '{{' && template.substring(template.length - 2, template.length) == '}}') {
        return template.substring(2, template.length - 2);
    } else {
        return template;
    }
}

// 获取模板对应的真实值
function getTemplateValue(objs, templateName) {
    for (let i = 0; i < objs.length; i++) {
        let temp = getValue(objs[i], templateName);
        if (temp) {
            return temp;
        }
    }
    return null;
}

function analysisAttr(vm, vnode) {
    if (vnode.nodeType != 1) {
        return;
    }
    let attrNames = vnode.elem.getAttributeNames();
    if (attrNames.indexOf('v-model') > -1) {
        setTemplate2VNode(vnode.elem.getAttribute('v-model'), vnode);
        setVNode2Template(vnode.elem.getAttribute('v-model'), vnode);
    }
}

export function getVnodeByTemplate(template) {
    return template2VNode.get(template);
}

export function clearMap() {
    template2VNode.clear();
    VNode2Template.clear();
}