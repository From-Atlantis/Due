//虚拟节点的定义 一个虚拟节点对应一个真实节点
let number = 1;
export default class VNode {
    constructor(tag, // 标签类型 比如DIV SPAN INPUT 或者文本节点
        elem, // 对应的真实节点 比如<div></div>
        children, // 当前节点下的子节点
        text, // 当前虚拟节点下的文本
        data, // VNodeData
        parent, // 父级节点
        nodeType // 节点类型
    ) {
        this.tag = tag;
        this.elem = elem;
        this.children = children;
        this.text = text;
        this.data = data;
        this.parent = parent;
        this.nodeType = nodeType;
        this.env = {}; // 当前节点的环境变量
        this.instruction = null; // 存放指令
        this.template = []; //当前节点涉及到的模板
        this.number = number++;
    }
}