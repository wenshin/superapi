'use strict';

const qs = require('querystring');
const request = require('superagent');
const mock = require('./mock');

function parseData(body) {
  return body.paging ? body : body.data;
}

// 从 superagent Request 对象中获取参数
function parseRequestData(req) {
  /* eslint-disable no-underscore-dangle */
  let query = {};
  if (req._query.length) {
    query = qs.parse(req._query.join('&'));
  }
  return Object.assign(query, req._data);
  /* eslint-enable */
}

function useMock(req, config) {
  let cfg = config;
  if (typeof config === 'string') cfg = {name: config};
  cfg.url = req.url;
  cfg.method = req.method;
  cfg.header = req.header;
  cfg.data = parseRequestData(req);
  cfg.mockPromise = (resBody, resolve, reject) => {
    if (!resBody) {
      resolve({});
    }
    if (resBody.success) {
      resolve(parseData(resBody));
    }
    reject(resBody.message);
  };

  return mock(cfg)
    .then(data => {
      req.abortLoading && req.abortLoading();
      return data;
    }, err => {
      req.abortLoading && req.abortLoading();
      return Promise.reject(err);
    });
}

request.Request.prototype.noAlert = function noAlert() {
  this.isNotAlert = true;
};

request.Request.prototype.promisify = function promisify(config) {
  let promise;
  if (this.method.toUpperCase() === 'POST') this.csrf();

  if (window.MYMSUseMock && config) {
    promise = useMock(this, config);
  } else {
    promise = new Promise((resolve, reject) => {
      this.end((err, res) => {
        if (err) return reject(err);
        if (!res.body) resolve({});
        if (res.body.success) {
          resolve(parseData(res.body));
        }
        return reject(res.body.message);
      });
    });
  }

  return this.isNotAlert
    ? promise
    : promise.catch(err => {
      return Promise.reject(err);
    });
};

function openLinkInNewTab(href, query) {
  let newHref = href;
  if (query) {
    const extraSearch = qs.stringify(query);
    if (href.indexOf('?') > -1) {
      newHref = `${href}&${extraSearch}`;
    } else {
      newHref = `${href}?${extraSearch}`;
    }
  }
  const anchor = document.createElement('a');
  anchor.href = newHref;
  anchor.target = '_blank';
  anchor.click();
}

request.openLinkInNewTab = openLinkInNewTab;

module.exports = request;
