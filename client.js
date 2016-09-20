/*
* sockjs for redux on browser
* (c) 2016 by superwf
* Released under the MIT Liscense.
*/
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var SockJS = _interopDefault(require('sockjs-client'));
var EventEmitter = _interopDefault(require('events'));
var uuid = _interopDefault(require('uuid'));

var isAction = (function (action) {
  return Boolean(action && action.type);
});

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/*
 * use redux as channelName, and check data must has "type" property
 * other usages are same as Channel
 * */
var generate = (function (Parent) {
  return function (_Parent) {
    inherits(ReduxChannel, _Parent);

    function ReduxChannel(connection) {
      classCallCheck(this, ReduxChannel);
      return possibleConstructorReturn(this, (ReduxChannel.__proto__ || Object.getPrototypeOf(ReduxChannel)).call(this, connection, 'redux'));
    }

    createClass(ReduxChannel, [{
      key: 'ondata',
      value: function ondata(data) {
        if (!isAction(data.data)) {
          throw new Error('redux channel data should has redux data and has "type" in redux object ' + JSON.stringify(data));
        }
        get(ReduxChannel.prototype.__proto__ || Object.getPrototypeOf(ReduxChannel.prototype), 'ondata', this).call(this, data);
      }

      /* check redux "type" attribute
       * and emit with type and channel by this.emitter to browser
       * */

    }, {
      key: 'send',
      value: function send(action) {
        if (!isAction(action)) {
          throw new Error('emit redux data should has "type"');
        }
        get(ReduxChannel.prototype.__proto__ || Object.getPrototypeOf(ReduxChannel.prototype), 'send', this).call(this, action);
      }
    }]);
    return ReduxChannel;
  }(Parent);
});

/* eslint-disable no-console */
var warn = function warn() {
  var _console;

  return (_console = console).warn.apply(_console, arguments);
};

/* all sockjs should dispatch to instance of this class
 * */

var Emitter = function (_EventEmitter) {
  inherits(Emitter, _EventEmitter);

  function Emitter(connection) {
    classCallCheck(this, Emitter);

    var _this = possibleConstructorReturn(this, (Emitter.__proto__ || Object.getPrototypeOf(Emitter)).call(this));

    _this.connection = connection;
    _this.setMaxListeners(100);

    _this.onmessage = _this.onmessage.bind(_this);

    _this.connection.onopen = function () {
      _this.emit('open');
    };

    _this.connection.onmessage = _this.onmessage;

    _this.connection.onclose = function () {
      _this.emit('close');
      _this.destroy();
    };
    return _this;
  }

  createClass(Emitter, [{
    key: 'onmessage',
    value: function onmessage(evt) {
      try {
        var data = JSON.parse(evt.data);
        this.emit('data', data);
      } catch (e) {
        warn(e);
      }
    }

    // send data to socket
    // no eventName, only data

  }, {
    key: 'send',
    value: function send(data) {
      this.connection.send(JSON.stringify(data));
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.removeAllListeners();
    }
  }]);
  return Emitter;
}(EventEmitter);

// multiple channel for single connection
var generateChannel = (function (Emitter) {
  return function (_EventEmitter) {
    inherits(Channel, _EventEmitter);

    /*
     * @param Object instance of server/eventEmitter
     * @param String channelName, channel name
     * */
    function Channel(socket, channelName) {
      classCallCheck(this, Channel);

      if (!channelName) {
        throw new Error('channel must has an channelName');
      }

      var _this = possibleConstructorReturn(this, (Channel.__proto__ || Object.getPrototypeOf(Channel)).call(this));

      _this.socket = socket;
      _this.channelName = channelName;
      _this._ondataFuncs = new Map();
      var emitter = new Emitter(socket);
      _this.emitter = emitter;
      _this.onopen = _this.onopen.bind(_this);
      _this.ondata = _this.ondata.bind(_this);
      _this.onclose = _this.onclose.bind(_this);
      emitter.on('open', _this.onopen);
      emitter.on('data', _this.ondata);
      emitter.on('close', _this.onclose);
      return _this;
    }

    createClass(Channel, [{
      key: 'onopen',
      value: function onopen() {
        this.emit('open');
      }

      /* add func that will invoke when ondata */

    }, {
      key: 'receive',
      value: function receive(func) {
        this._ondataFuncs.set(func, func.bind(this));
      }

      /* remove func that will invoke when ondata */

    }, {
      key: 'remove',
      value: function remove(func) {
        this._ondataFuncs.delete(func);
      }
    }, {
      key: 'ondata',
      value: function ondata(data) {
        if (data && data.type === 'channel' && data.channel === this.channelName) {
          this._ondataFuncs.forEach(function (func) {
            return func(data.data);
          });
        }
      }
    }, {
      key: 'onclose',
      value: function onclose() {
        this.destroy();
      }

      /* send with channel by this.emitter to browser
       */

    }, {
      key: 'send',
      value: function send(data) {
        this.emitter.send({ type: 'channel', channel: this.channelName, data: data });
      }

      // clear all listeners, free memory

    }, {
      key: 'destroy',
      value: function destroy() {
        this.removeAllListeners();
        this._ondataFuncs = null;
        var emitter = this.emitter;

        emitter.removeListener('open', this.onopen);
        emitter.removeListener('data', this.ondata);
        emitter.removeListener('close', this.onclose);
      }
    }]);
    return Channel;
  }(EventEmitter);
});

var Channel = generateChannel(Emitter);

var ReduxChannel = generate(Channel);

var startReduxClient = (function () {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$port = _ref.port;
  var port = _ref$port === undefined ? 3000 : _ref$port;
  var _ref$domain = _ref.domain;
  var domain = _ref$domain === undefined ? '127.0.0.1' : _ref$domain;
  var _ref$sockjsPrefix = _ref.sockjsPrefix;
  var sockjsPrefix = _ref$sockjsPrefix === undefined ? '/sockjs' : _ref$sockjsPrefix;
  var _ref$protocal = _ref.protocal;
  var protocal = _ref$protocal === undefined ? 'http' : _ref$protocal;

  var socket = new SockJS(protocal + '://' + domain + ':' + port + sockjsPrefix);
  var reduxChannel = new ReduxChannel(socket);
  return reduxChannel;
});

var ActionTypes = {
  SOCKJS: '@@sockjs',
  NOOP_ACTION: '@@sockjs-noop'
};

var actionEmitters = [];

/**
 * @param {ReduxChannel} ReduxChannel instance
 * @param {Number} timeoutInterval, unit milisecond
 * @return {Function} action creator that bound to reduxChannel
 */
var createAction = function createAction(reduxChannel) {
  var timeoutInterval = arguments.length <= 1 || arguments[1] === undefined ? 1000 : arguments[1];

  var actionEmitter = new EventEmitter();
  actionEmitters.push(actionEmitter);
  actionEmitter.setMaxListeners(100);
  var ondataFunc = function ondataFunc(action) {
    var token = action.token;

    if (token && actionEmitter.listeners(token).length) {
      actionEmitter.emit(token, action);
      /* for action from other sockjs connection */
    } else {
      actionEmitter.emit(ActionTypes.SOCKJS, action);
    }
  };
  reduxChannel.receive(ondataFunc);
  /* send payload to server
   * returnPromise model will return promise
   * async will return an empty action that should do nothing by redux store
   * */
  return function (type) {
    var returnPromise = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
    return function (payload) {
      if (returnPromise) {
        return new Promise(function (resolve, reject) {
          var token = uuid();
          reduxChannel.send({
            type: type,
            payload: payload,
            token: token
          });
          var timer = 0;
          var resolver = function resolver(action) {
            resolve(action);
            clearTimeout(timer);
          };
          timer = setTimeout(function () {
            actionEmitter.removeListener(token, resolver);
            reject('type: ' + type + ', token: ' + token + ', payload: ' + payload + ' failed because timeout more than ' + timeoutInterval);
          }, timeoutInterval);
          actionEmitter.once(token, resolver);
        });
      }
      reduxChannel.send({
        type: type,
        payload: payload
      });
      return { type: ActionTypes.NOOP_ACTION };
    };
  };
};

/**
 * @param {Object} reducerMap
 * @param {any} initialState
 * @return {Function}
 */
var createReducer = function createReducer(reducerMap, initialState) {
  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
    var action = arguments[1];
    var type = action.type;

    if (type in reducerMap) {
      return reducerMap[type](state, action);
    }
    return state;
  };
};

/* for action from other sockjs connection */
var middleware = function middleware(_ref) {
  var dispatch = _ref.dispatch;

  var actionEmitter = actionEmitters.shift();
  if (!actionEmitter) {
    throw new Error('need createAction(reduxChannel) first to make an actionEmitter');
  }
  actionEmitter.on(ActionTypes.SOCKJS, function (action) {
    dispatch(action);
  });
  return function (next) {
    return function (action) {
      return next(action);
    };
  };
};

exports.startReduxClient = startReduxClient;
exports.createAction = createAction;
exports.createReducer = createReducer;
exports.middleware = middleware;