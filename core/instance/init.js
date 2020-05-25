import {
    constructProxy
} from './proxy.js';

import {
    mount
} from './mount.js';

// 记录每个Due对象的uid
let uid = 0;

// 导出初始化函数
export function initMixin(Due) {
    Due.prototype._init = function (options) {
        const vm = this;
        // 初始化uid
        vm.uid = uid++;
        vm._isDue = true;
        // 初始化data
        if (options && options.data) {
            // 设置代理
            vm._data = constructProxy(vm, options.data, '');
        }
        // 初始化methods
        if (options && options.methods) {
            vm._methods = options.methods;
            for (let temp in options.methods) {
                vm[temp] = options.methods[temp];
            }
        }
        // 初始化el并挂载
        if (options && options.el) {
            // 拿到根节点
            let rootDom = document.getElementById(options.el);
            mount(vm, rootDom);
        }
    }
}