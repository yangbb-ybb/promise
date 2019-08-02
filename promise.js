// 实现promise的方法
// 你就是个垃圾 
class mPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = function () { };
    this.onRejectedCallbacks = function () { };
    // 内部变量 你都不知道
    let resolve = value => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onResolvedCallbacks()
      }
    };
    let reject = reason => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks()
      }
    };
    // 坑蒙拐骗
    try {
      // 当是then 调用的时候 是不会执行 内部函数的 所以不管
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
  // promise 能链式调用的原因是 每次都返回 一个新的promise，而他把当前then方法存在了自己的promise里面  所以他能够完成 链式调用
  // promise then 方法
  /**
   * 理解了 promise 了这个then 方法 promise基本就全部理解了 
   * 还是从同步开始 一点一点 来
   * 同步：当进入到这里的 时候 当前的状态 肯定是 fulfilled
   * 死磕她
   * new promise().then()
   */
  // then 函数 肯定是只会 调用一次的
  /**
   * Q1：then 方法 只会 调用一次，那么 他是怎么链式 调用成功的
   */
  /**
   * 新问题： 我们新的promise的 时候，为什么这个 state 都保持 和第一个一直
   */
  then(onFulfilled, onRejected) {
    // console.log('%center then func!!!', 'color:red');
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };
    // 这里的 this 肯定是 new promise()  promise1这个 实例
    return new mPromise((resolve, reject) => {
      /**
       * Q1 为什么 这里的 状态 不是pending
       * A1 这里的 this是谁  
       * Q2 这里的this 为什么 指向的是外面的
       * A2 因为我用的ES6语法　哈哈哈　傻逼了把
       * Q3 若按照 你的理解 上面的理解 你为什么 可以用 =  赋值
       * A3 我们读取 then 时，都是读取上一个promise 所以也是没问题的
       */
      /**
       * 先看只有一个的 时候：且同步的时候
       * 这里的状态 肯定是 fulfilled  
       * MD 好多坑啊 都是知识点
       */
      // 当状态是fulfilled的时候 直接执行外部函数
      if (this.state === 'fulfilled') {
        try {
          // 哈哈 我胡汉三 又回来了
          // 继续 你个傻逼 继续问啊 哈哈哈哈
          // 好 那我继续了 继续同步操作，
          // 拾人牙慧
          /**
           * 当前 状态 是 fulfill的 时候 直接调用
           */
          let x = onFulfilled(this.value); //调用了 外部函数
          // 我要
          // 当外部promise的状态是 fulfilled 的时候
          // reslove 内部函数
          resolvePromise(this, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      };
      // 加油 今年 我能进去 
      if (this.state === 'rejected') {
        try {
          // 当状态是reject的时候 直接执行我们的回调函数  
          // 运行然回调函数后 的 reslovePromise是做什么的 
          let x = onRejected(this.reason);
          resolvePromise(this, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      };

      //先忽略 -----
      if (this.state === 'pending') {
        this.onResolvedCallbacks = () => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(this, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }
        this.onRejectedCallbacks = () => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(this, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }
      };
    });
  }
  catch(fn) {
    return this.then(null, fn);
  }
}
//  这傻逼是 干什么的
//  为什么 要抽出 这个方法就是 未来解决 当我们return 一个新的 promise 的时候
function resolvePromise(promise2, x, resolve, reject) {
  // if (x === promise2) {
  //   return reject(new TypeError('Chaining cycle detected for promise'));
  // }
  /**
   * 调用 reslove就改变了当前的状态
   */
  //console.error(x, typeof x);
  let called;
  if (x instanceof mPromise) {
    // 函数
    let then = x.then;// 肯定有 then 方法
    // ok 麻痹的 我去年 看的是什么 垃圾
    // 这个是 关键的函数
    // promise.then(success,fail);
    /**
     * 这个y 是怎么进来的
     */
    //直接 调用它的 then 方法
    //好吧 这个 套路好深 我服了 大神
    // 这里直接 调用一个
    // 好吧 这个 y 就是  reslove 的值
    then.call(x, y => {
      if (called) return;
      called = true;
      resolvePromise(promise2, y, resolve, reject);
    }, err => {
      if (called) return;
      called = true;
      reject(err);
    })
  } else {
    resolve(x);
  }
}
//resolve方法
// mPromise.resolve = function (val) {
//   return new mPromise((resolve, reject) => {
//     resolve(val)
//   });
// }
// //reject方法
// mPromise.reject = function (val) {
//   return new mPromise((resolve, reject) => {
//     reject(val)
//   });
// }
// //race方法 
// mPromise.race = function (promises) {
//   return new mPromise((resolve, reject) => {
//     for (let i = 0; i < promises.length; i++) {
//       promises[i].then(resolve, reject)
//     };
//   })
// }
// //all方法(获取所有的promise，都执行then，把结果放到数组，一起返回)
// mPromise.all = function (promises) {
//   let arr = [];
//   let i = 0;
//   function processData(index, data) {
//     arr[index] = data;
//     i++;
//     if (i == promises.length) {
//       resolve(arr);
//     };
//   };
//   return new mPromise((resolve, reject) => {
//     for (let i = 0; i < promises.length; i++) {
//       promises[i].then(data => {
//         processData(i, data);
//       }, reject);
//     };
//   });
// }
