'use strict';
const methods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'option'];

function SuperApi(config) {
  if (!(this instanceof SuperApi)) {
    return new SuperApi(config);
  }
  if (!SuperApi.request) throw new Error('config.httpLib is required');

  this._config = Object.assign({}, SuperApi._config, config);
  this.docs = {};
  this.optionsByMethod = {};
  this.request = this._config.httpLib;

  this.delegate();
}

SuperApi.prototype = {
  delegate() {
    for (const method of methods) {
      const request = this.request[method];
      if (!request) continue;
      this[method] = request.bind(request, this._getUrl);
    }
  },

  _getUrl(query) {
    const url = `${this._config.baseUrl}/${this._config.basePath}/${this._path}`;
    return url.replace(/\/\/\/?/g, '/');
  },

  title(title) {
    this.docs.title = title;
    return this;
  },

  desc(desc) {
    this.docs.desc = desc;
    return this;
  },

  tip(tip) {
    this.docs.tip = tip;
    return this;
  },

  path(path) {
    this._path = path;
    return this;
  },

  action(method, options) {
    this.optionsByMethod[method] = options;
    return this;
  }
};

SuperApi._config = {
  baseUrl: '',
  basePath: '/',
  headers: {},
  httpLib: null,
  mock: false,
  valid: false,
  verbose: false
};

Object.defineProperty(SuperApi, 'request', {
  get() {
    return SuperApi._config.httpLib;
  }
})

SuperApi.config = function(config) {
  Object.assign(SuperApi._config, config);
}

module.exports = SuperApi;
