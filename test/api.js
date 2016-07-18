const assert = require('assert');
const superagent = require('superagent');
const vajs = require('vajs');
const superapi = require('../lib');

// 配置全局API
superapi.config({
  mock: true,
  verbose: true,
  httpLib: superagent
});

// 实例化一个新API
let api = superapi({maintainers: '', baseUrl: 'http://localhost:8888/api'});

// vajs add oneOf([
//   {value: 1, label: 'Option1'},
//   {value: 2, label: 'Option2'},
//   {value: 3, label: 'Option3'}
// ])
// vajs add manyOf([
//   {value: 1, label: 'Option1'},
//   {value: 2, label: 'Option2'},
//   {value: 3, label: 'Option3'}
// ], (input) => input.split(','))
// vajs add date('YYYY-MM-DD HH:mm:ss') by moment
// vajs add json()

describe('superapi', () => {
  it('chain call', (done) => {
    let queryModel = {
      page: vajs.number({min: 1}),
      perPage: vajs.number({min: 1})
    };

    let headers = {
      'X-Requested-With': 'XMLHttpRequest'
    };

    let home = api
      .title('首页')
      .desc('获取首页信息')
      .path('/')
      .action('get', {query: queryModel, headers});

    home
      .get({page: 0})
      .then(() => done());

    // let users = api
    //   .baseUrl(base)
    //   .path('/users')
    //   .act('get', {query: queryModel, headers})
    //   .act('post', {query: queryModel, data: bodyModel, headers})
    //   .mock('mock-users');
    //
    // let user = api
    //   .baseUrl(users)
    //   .path('/:id') // 'id' is in queryModel
    //   .act('get', {query: queryModel, headers})
    //   .act('put', {query: queryModel, data: bodyModel, headers})
    //   .act('post', {query: queryModel, data: bodyModel, headers})
    //   .act('patch', {query: queryModel, data: bodyModel, headers})
    //   .act('delete', {query: queryModel, headers})
    //   .mock('user');
    //
    // let userComments = api
    //   .baseUrl(user)
    //   .path('/comments')
    //   .act('get', {query: queryModel, headers});
  });
})
