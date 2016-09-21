/*
* sockjs for redux on server
* (c) 2016 by superwf
* Released under the MIT Liscense.
*/
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var sockjs = _interopDefault(require('sockjs'));
var EventEmitter = _interopDefault(require('events'));
var http = _interopDefault(require('http'));

var identity = (function (a) {
  return a;
});

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
var connections = [];

var Emitter = function (_EventEmitter) {
  inherits(Emitter, _EventEmitter);

  function Emitter(socket) {
    classCallCheck(this, Emitter);

    var _this = possibleConstructorReturn(this, (Emitter.__proto__ || Object.getPrototypeOf(Emitter)).call(this));

    _this.socket = socket;
    _this.setMaxListeners(100);
    _this.onconnection = _this.onconnection.bind(_this);
    socket.on('connection', _this.onconnection);
    return _this;
  }

  createClass(Emitter, [{
    key: 'onconnection',
    value: function onconnection(connection) {
      var _this2 = this;

      connections.push(connection);
      this.connection = connection;
      this.ondata = this.ondata.bind(this);
      connection.on('data', this.ondata);
      connection.on('close', function () {
        connection.removeAllListeners();
        connection.close();
        var index = connections.findIndex(function (c) {
          return c === connection;
        });
        connections.splice(index, 1);
        _this2.destroy();
      });
      this.emit('open');
    }
  }, {
    key: 'ondata',
    value: function ondata(message) {
      try {
        var data = JSON.parse(message);
        this.emit('data', data);
      } catch (e) {
        warn(e);
      }
    }

    /* emit data to connection no eventName, only data */

  }, {
    key: 'send',
    value: function send(data) {
      this.connection.write(JSON.stringify(data));
    }
  }, {
    key: 'broadcast',
    value: function broadcast(data) {
      var _this3 = this;

      var includeSelf = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      connections.forEach(function (connection) {
        if (!includeSelf && _this3.connection === connection) {
          return;
        }
        connection.write(JSON.stringify(data));
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.removeAllListeners();
    }
  }]);
  return Emitter;
}(EventEmitter);

Emitter.connections = connections;

/* multiple channel for single connection */
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
        this.emit('close');
      }

      /* send with channel by this.emitter to browser
       */

    }, {
      key: 'send',
      value: function send(data) {
        this.emitter.send({ type: 'channel', channel: this.channelName, data: data });
      }

      /* clear all listeners, free memory */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.removeAllListeners();
      }
    }]);
    return Channel;
  }(EventEmitter);
});

var Channel = generateChannel(Emitter);

var ServerChannel = function (_Channel) {
  inherits(ServerChannel, _Channel);

  function ServerChannel() {
    classCallCheck(this, ServerChannel);
    return possibleConstructorReturn(this, (ServerChannel.__proto__ || Object.getPrototypeOf(ServerChannel)).apply(this, arguments));
  }

  createClass(ServerChannel, [{
    key: 'broadcast',
    value: function broadcast(data) {
      var includeSelf = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      this.emitter.broadcast({ type: 'channel', channel: this.channelName, data: data }, includeSelf);
    }
  }]);
  return ServerChannel;
}(Channel);

var ReduxChannel = generate(ServerChannel);

var defaultHttpServer = (function () {
  var server = http.createServer();
  // server.addListener('upgrade', (req, res) => {
  //   res.end()
  // })
  return server;
});

// import store from './store'

var startReduxServer = (function () {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$port = _ref.port;
  var port = _ref$port === undefined ? 3000 : _ref$port;
  var _ref$ip = _ref.ip;
  var ip = _ref$ip === undefined ? '0.0.0.0' : _ref$ip;
  var _ref$sockjsPrefix = _ref.sockjsPrefix;
  var sockjsPrefix = _ref$sockjsPrefix === undefined ? '/sockjs-redux' : _ref$sockjsPrefix;
  var _ref$log = _ref.log;
  var log = _ref$log === undefined ? identity : _ref$log;
  var server = _ref.server;

  var sockserver = sockjs.createServer({
    sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js',
    log: log
  });
  var channel = new ReduxChannel(sockserver);

  var httpServer = server || defaultHttpServer();

  sockserver.installHandlers(httpServer, { prefix: sockjsPrefix });
  httpServer.listen(port, ip);
  return channel;
});

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
    // console.log(Object.keys(reducerMap))

    if (type in reducerMap) {
      return reducerMap[type](state, action);
    }
    return state;
  };
};

exports.startReduxServer = startReduxServer;
exports.createReducer = createReducer;