"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createIsPrime = void 0;

var _collection = require("../../utils/collection.js");

var _factory = require("../../utils/factory.js");

var name = 'isPrime';
var dependencies = ['typed'];
var createIsPrime = /* #__PURE__ */(0, _factory.factory)(name, dependencies, function (_ref) {
  var typed = _ref.typed;

  /**
   * Test whether a value is prime: has no divisors other than itself and one.
   * The function supports type `number`, `bignumber`.
   *
   * The function is evaluated element-wise in case of Array or Matrix input.
   *
   * Syntax:
   *
   *     math.isPrime(x)
   *
   * Examples:
   *
   *    math.isPrime(3)                     // returns true
   *    math.isPrime(-2)                    // returns false
   *    math.isPrime(0)                     // returns false
   *    math.isPrime(-0)                    // returns false
   *    math.isPrime(0.5)                   // returns false
   *    math.isPrime('2')                   // returns true
   *    math.isPrime([2, 17, 100])           // returns [true, true, false]
   *
   * See also:
   *
   *    isNumeric, isZero, isNegative, isInteger
   *
   * @param {number | BigNumber | Array | Matrix} x  Value to be tested
   * @return {boolean}  Returns true when `x` is larger than zero.
   *                    Throws an error in case of an unknown data type.
   */
  return typed(name, {
    number: function number(x) {
      if (x * 0 !== 0) {
        return false;
      }

      if (x <= 3) {
        return x > 1;
      }

      if (x % 2 === 0 || x % 3 === 0) {
        return false;
      }

      for (var i = 5; i * i <= x; i += 6) {
        if (x % i === 0 || x % (i + 2) === 0) {
          return false;
        }
      }

      return true;
    },
    BigNumber: function BigNumber(n) {
      if (n.toNumber() * 0 !== 0) {
        return false;
      }

      if (n.lte(3)) return n.gt(1);
      if (n.mod(2).eq(0) || n.mod(3).eq(0)) return false;

      for (var i = 5; n.gte(i * i); i += 6) {
        if (n.mod(i).eq(0) || n.mod(i + 2).eq(0)) {
          return false;
        }
      }

      return true;
    },
    'Array | Matrix': function ArrayMatrix(x) {
      return (0, _collection.deepMap)(x, this);
    }
  });
});
exports.createIsPrime = createIsPrime;