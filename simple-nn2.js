//(function () {
  // example is based on the numpy neural network tutorial featured here
  // https://iamtrask.github.io/2015/07/12/basic-python-network/
  'use strict';

  var Matrix = require('vectorious').Matrix;

  function sigmoid(ddx) {
    return function (x) {
      return ddx ?
        x * (1 - x) :
        1.0 / (1 + Math.exp(-x));
    };
  }

  // input
  var X = new Matrix([
    [0, 0, 1],
    [0, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ]);

  // output
  var y = new Matrix([[0, 1, 1, 0]]).T;

  // initialize weights with a standard deviation of 2 and mean -1
  var syn0 = Matrix.random.apply(null, X.T.shape, 2, -1), //shape (3, 4)
      syn1 = Matrix.random.apply(null, y.shape, 2, -1); //shape (4, 1)
      
  
  // layers and deltas
  var l0, l1, l0_delta, l1_delta;

  for (var i = 0; i < 60000; i++) {
    
    //forward propagation
    l0 = X.multiply(syn0).map(sigmoid()); //X: first layer, l0: second layer-hidden layer (4, 3) dot (3, 4) = (4, 4)
    l1 = l0.multiply(syn1).map(sigmoid()); //final layer-output (4, 4) dot (4, 1) = (4, 1)
    //how much did we miss? Multiply how much we missed by the slope of the sigmoid at the values in l1
    l1_delta = Matrix.subtract(y, l1).product(l1.map(sigmoid(true)));
    l0_delta = l1_delta.multiply(syn1.T).product(l0.map(sigmoid(true)));

    //update weights
    syn1.add(l0.T.multiply(l1_delta));
    syn0.add(X.T.multiply(l0_delta));
  }

  // final trained neural network output!
  // should be close to [[0, 1, 1, 0]] transpose
  console.log(l1.toArray());
//}());