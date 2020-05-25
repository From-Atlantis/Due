// Due模块的所在地

//导入初始化Due模块的函数
import {
    initMixin
} from './init.js';
import {
    initMount
} from './mount.js';
import {
    renderMixin
} from './render.js';

// 执行初始化Due模块的函数 即使Due的原型上绑定_init方法
initMixin(Due);

// 另一种挂载方式添加到Due原型上
initMount(Due);

// 渲染函数
renderMixin(Due);

// Due本体
function Due(options) {
    // 执行初始化函数
    this._init(options);

    // 执行渲染函数
    this._render();
}

// 导出Due
export default Due;