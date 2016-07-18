function random(max) {
  return Math.floor(Math.random() * max);
}

const configsByName = {};

/**
 * 生成 mock 数据的 promise
 * @param  {String}         config.name           [Optional]
 * Mock 名称，通过 mock.register 方法注册
 * @param  {Number}         config.delay          [Optional]
 * 当 delay === undefined 时，生成随机时间。
 * 当 !delay && delay !== 0 时，不返回 promise 对象，直接返回 mock 数据
 * @param  {Function|Array} config.mocks          [Optional]
 * 如果 config.name 不存在则必须有值。
 * @param  {String}         config.url            [Required]
 * @param  {String}         config.header         [Optional]
 * @param  {String}         config.method         [OPtional]
 * @param  {Number}         config.data           [Optional]
 * config.mocks 为函数时作为第一个参数
 * @param  {Number}         config.choose         [Optional]
 * @param  {Function}       config.mockPromise    [Optional]
 * 处理返回结果的 promise 逻辑，接受3个参数（mockData, resolve, reject）
 * @return {Promise|Object|Array}
 */
function mock(config) {
  console.warn('WATCHOUT: Using Mock Data!!!'); // eslint-disable-line no-console

  let cfg = {};
  if (!config) throw Error('Mock config not exist');

  if (config.name) cfg = configsByName[config.name];
  if (!cfg) throw Error(`Mock config ${config.name} not exist`);

  cfg = Object.assign({}, cfg, config);
  if (!cfg.mocks) throw Error('Mock config.mocks not exist');

  // show the real request info
  console.info( // eslint-disable-line no-console
    `Mock Request:[${cfg.method.toUpperCase()}]${cfg.url}`,
    cfg.data, cfg.header
  );

  const mocks = cfg.mocks instanceof Function
    ? cfg.mocks(cfg.data, cfg)
    : cfg.mocks;

  let mockData;
  if (cfg.choose || cfg.choose === 0) {
    mockData = mocks[cfg.choose];
    if (!mockData) throw Error('Mock data not exist!');
  } else {
    mockData = mocks[random(mocks.length)];
  }

  console.log('Mock Data: ', mockData); // eslint-disable-line no-console

  const delay = cfg.delay === undefined
    ? Math.min(random(5000), 2000)
    : cfg.delay;
  if (!delay && delay !== 0) return mockData;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (cfg.mockPromise) {
        cfg.mockPromise(mockData, resolve, reject);
      } else {
        resolve(mockData);
      }
    }, delay);
  });
}

function randomValue(options) {
  if (!options || !options.length) return null;
  return options[mock.random(options.length - 1)];
}

function mockId(id) {
  return `mock-${id || random(1e6)}`;
}

function repeat(data, count = 1, modifier) {
  const ret = [];
  for (let i = 0; i < count; i++) {
    const dataNew = Object.assign({}, data, {id: mockId()});
    ret.push(modifier ? modifier(dataNew, i) : dataNew);
  }
  return ret;
}

function paginate({total, offset, limit, repeatData, repeatModifier}) {
  if (!offset || !total || !limit || !repeatData) {
    throw new Error('mock.paginate need {total, offset, limit, repeatData} params');
  }

  /* eslint-disable no-param-reassign */
  offset = Number(offset);
  total = Number(total);
  limit = Number(limit);
  /* eslint-enable */
  
  if (offset % limit) {
    throw Error('offset not right for paginating');
  }

  let data = [];
  if (offset < total) {
    data = repeat(repeatData, Math.min(total - offset, limit), repeatModifier);
  }
  return {
    data,
    paging: {total, offset, limit}
  };
}


mock.random = random;
mock.randomValue = randomValue;
mock.mockId = mockId;
mock.repeat = repeat;
mock.paginate = paginate;

/**
 * 注册 mock config，注册后的 config 可以通过 mock({name}) 直接使用
 * @param  {String} name   [description]
 * @param  {Object} config 调用 mock(config) 获取 mock promise 对象
 * @return {[type]}        [description]
 */
function register(name, config) {
  configsByName[name] = config;
}

mock.register = register;

module.exports = mock;
