import {
    renderData
} from "./render.js";
import {
    rebuild
} from "./mount.js";

// 获取数组原型 便于使用上面的原生方法
const arrayProto = Array.prototype;

// 对原生的方法进行代理包裹 做更多的操作 但其实还是用到了原生方法
function defArrayFunc(obj, func, namespace, vm) {
    Object.defineProperty(obj, func, {
        configurable: true,
        enumerable: true,
        value: function (...args) {
            let original = arrayProto[func];
            const result = original.apply(this, args);
            rebuild(vm, getNameSpace(namespace, ''));
            renderData(vm, getNameSpace(namespace, ''));
            return result;
        }
    })
}

// 处理数组类型的data
function constructArrayProxy(vm, data, namespace) {
    // 用来做代理的对象 我们将数组的方法写在其中一一进行代理 再让data的__proto__指向obj
    // 即可拓展每一个数组方法
    let obj = {
        eleType: 'Array',
        toString() {},
        push() {},
        pop() {},
        shift() {},
        unshift() {}
    }

    // 对每一个数组方法进行代理
    defArrayFunc.call(this, obj, 'toString', namespace, vm);
    defArrayFunc.call(this, obj, 'push', namespace, vm);
    defArrayFunc.call(this, obj, 'pop', namespace, vm);
    defArrayFunc.call(this, obj, 'shift', namespace, vm);
    defArrayFunc.call(this, obj, 'unshift', namespace, vm);

    // 改变原型指向
    data.__proto__ = obj;
    // 返回改变后的data
    return data;
}

// 处理对象类型的data
function constructObjectProxy(vm, data, namespace) {
    //设置代理对象 注意一定要是空对象
    let proxyObj = {};

    // 遍历data对象
    for (let prop in data) {
        // 在实例的_data上设置代理
        Object.defineProperty(proxyObj, prop, {
            configurable: true,
            get() {
                return data[prop];
            },
            set(value) {
                console.log(getNameSpace(namespace, prop));
                data[prop] = value;
                renderData(vm, getNameSpace(namespace, prop));
            }
        })

        // 在实例上设置代理
        Object.defineProperty(vm, prop, {
            configurable: true,
            get() {
                return data[prop];
            },
            set(value) {
                console.log(getNameSpace(namespace, prop));
                data[prop] = value;
                renderData(vm, getNameSpace(namespace, prop));
            }
        })

        // 对data中的对象或数组 或更深层的对象或数组进行迭代处理
        if (data[prop] instanceof Object) {
            // vm实例上的_data是由proxyObj来代理的
            proxyObj[prop] = constructProxy(vm, data[prop], getNameSpace(namespace, prop));
        }
    }
    return proxyObj;
}

// 使用代理来访问数据 与vue原理相同 也是使用definePropety
// 这样就可以实现对data中每个属性的监控 在修改data中的某个属性時
// 就会调用setter方法 在setter方法中对页面进行实时的修改

// vm代表Due实例 data代表data namespace代表修改的是什么属性
export function constructProxy(vm, data, namespace) {
    let tempData = null;
    // 判断data是对象还是数组 进行不同的处理 注意这里是先判断的数组 因为[] instanceof Object为true的
    if (data instanceof Array) {
        tempData = new Array(data.length);
        for (let i = 0; i < data.length; i++) {
            // 对数组中的每个变量进行代理
            tempData[i] = constructProxy(vm, data[i], namespace);
        }
        // 对数组本身进行代理
        tempData = constructArrayProxy(vm, data, namespace);
    } else if (data instanceof Object) {
        tempData = constructObjectProxy(vm, data, namespace);
    } else {
        throw new Error('error');
    }
    return tempData;
}

// 返回当前修改的属性的全称
function getNameSpace(nowNameSpace, prop) {
    if (nowNameSpace === null || nowNameSpace === '') {
        return prop;
    } else if (prop === '' || prop === null) {
        return nowNameSpace;
    } else {
        return nowNameSpace + '.' + prop;
    }
}