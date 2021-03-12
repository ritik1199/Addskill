"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createUsolveAll = void 0;

var _factory = require("../../../utils/factory.js");

var _solveValidation = require("./utils/solveValidation.js");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var name = 'usolveAll';
var dependencies = ['typed', 'matrix', 'divideScalar', 'multiplyScalar', 'subtract', 'equalScalar', 'DenseMatrix'];
var createUsolveAll = /* #__PURE__ */(0, _factory.factory)(name, dependencies, function (_ref) {
  var typed = _ref.typed,
      matrix = _ref.matrix,
      divideScalar = _ref.divideScalar,
      multiplyScalar = _ref.multiplyScalar,
      subtract = _ref.subtract,
      equalScalar = _ref.equalScalar,
      DenseMatrix = _ref.DenseMatrix;
  var solveValidation = (0, _solveValidation.createSolveValidation)({
    DenseMatrix: DenseMatrix
  });
  /**
   * Finds all solutions of a linear equation system by backward substitution. Matrix must be an upper triangular matrix.
   *
   * `U * x = b`
   *
   * Syntax:
   *
   *    math.usolve(U, b)
   *
   * Examples:
   *
   *    const a = [[-2, 3], [2, 1]]
   *    const b = [11, 9]
   *    const x = usolve(a, b)  // [ [[8], [9]] ]
   *
   * See also:
   *
   *    usolve, lup, slu, usolve, lusolve
   *
   * @param {Matrix, Array} U       A N x N matrix or array (U)
   * @param {Matrix, Array} b       A column vector with the b values
   *
   * @return {DenseMatrix[] | Array[]}  An array of affine-independent column vectors (x) that solve the linear system
   */

  return typed(name, {
    'SparseMatrix, Array | Matrix': function SparseMatrixArrayMatrix(m, b) {
      return _sparseBackwardSubstitution(m, b);
    },
    'DenseMatrix, Array | Matrix': function DenseMatrixArrayMatrix(m, b) {
      return _denseBackwardSubstitution(m, b);
    },
    'Array, Array | Matrix': function ArrayArrayMatrix(a, b) {
      var m = matrix(a);

      var R = _denseBackwardSubstitution(m, b);

      return R.map(function (r) {
        return r.valueOf();
      });
    }
  });

  function _denseBackwardSubstitution(m, b_) {
    // the algorithm is derived from
    // https://www.overleaf.com/project/5e6c87c554a3190001a3fc93
    // array of right-hand sides
    var B = [solveValidation(m, b_, true)._data.map(function (e) {
      return e[0];
    })];
    var M = m._data;
    var rows = m._size[0];
    var columns = m._size[1]; // loop columns backwards

    for (var i = columns - 1; i >= 0; i--) {
      var L = B.length; // loop right-hand sides

      for (var k = 0; k < L; k++) {
        var b = B[k];

        if (!equalScalar(M[i][i], 0)) {
          // non-singular row
          b[i] = divideScalar(b[i], M[i][i]);

          for (var j = i - 1; j >= 0; j--) {
            // b[j] -= b[i] * M[j,i]
            b[j] = subtract(b[j], multiplyScalar(b[i], M[j][i]));
          }
        } else if (!equalScalar(b[i], 0)) {
          // singular row, nonzero RHS
          if (k === 0) {
            // There is no valid solution
            return [];
          } else {
            // This RHS is invalid but other solutions may still exist
            B.splice(k, 1);
            k -= 1;
            L -= 1;
          }
        } else if (k === 0) {
          // singular row, RHS is zero
          var bNew = _toConsumableArray(b);

          bNew[i] = 1;

          for (var _j = i - 1; _j >= 0; _j--) {
            bNew[_j] = subtract(bNew[_j], M[_j][i]);
          }

          B.push(bNew);
        }
      }
    }

    return B.map(function (x) {
      return new DenseMatrix({
        data: x.map(function (e) {
          return [e];
        }),
        size: [rows, 1]
      });
    });
  }

  function _sparseBackwardSubstitution(m, b_) {
    // array of right-hand sides
    var B = [solveValidation(m, b_, true)._data.map(function (e) {
      return e[0];
    })];
    var rows = m._size[0];
    var columns = m._size[1];
    var values = m._values;
    var index = m._index;
    var ptr = m._ptr; // loop columns backwards

    for (var i = columns - 1; i >= 0; i--) {
      var L = B.length; // loop right-hand sides

      for (var k = 0; k < L; k++) {
        var b = B[k]; // values & indices (column i)

        var iValues = [];
        var iIndices = []; // first & last indeces in column

        var firstIndex = ptr[i];
        var lastIndex = ptr[i + 1]; // find the value at [i, i]

        var Mii = 0;

        for (var j = lastIndex - 1; j >= firstIndex; j--) {
          var J = index[j]; // check row

          if (J === i) {
            Mii = values[j];
          } else if (J < i) {
            // store upper triangular
            iValues.push(values[j]);
            iIndices.push(J);
          }
        }

        if (!equalScalar(Mii, 0)) {
          // non-singular row
          b[i] = divideScalar(b[i], Mii); // loop upper triangular

          for (var _j2 = 0, _lastIndex = iIndices.length; _j2 < _lastIndex; _j2++) {
            var _J = iIndices[_j2];
            b[_J] = subtract(b[_J], multiplyScalar(b[i], iValues[_j2]));
          }
        } else if (!equalScalar(b[i], 0)) {
          // singular row, nonzero RHS
          if (k === 0) {
            // There is no valid solution
            return [];
          } else {
            // This RHS is invalid but other solutions may still exist
            B.splice(k, 1);
            k -= 1;
            L -= 1;
          }
        } else if (k === 0) {
          // singular row, RHS is zero
          var bNew = _toConsumableArray(b);

          bNew[i] = 1; // loop upper triangular

          for (var _j3 = 0, _lastIndex2 = iIndices.length; _j3 < _lastIndex2; _j3++) {
            var _J2 = iIndices[_j3];
            bNew[_J2] = subtract(bNew[_J2], iValues[_j3]);
          }

          B.push(bNew);
        }
      }
    }

    return B.map(function (x) {
      return new DenseMatrix({
        data: x.map(function (e) {
          return [e];
        }),
        size: [rows, 1]
      });
    });
  }
});
exports.createUsolveAll = createUsolveAll;