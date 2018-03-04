import cfg from '../util';
import Item from './item';

const mongoose = require('mongoose');
let db;

if (cfg.db === '') {
  console.log('Database connection string is empty. Please check config file');
  process.exit(0);
}

mongoose.connect(cfg.db);
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + cfg.db);
});
mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});
mongoose.connection.on('open', function () {
  console.log('Mongoose default connection is open');
});
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

async function getItemsAsync(from, n, type, search) {
  return new Promise((resolve, reject) => {
    let condition = {};
    if (search) {
      condition['$or'] = [
        {
          keyw: new RegExp(search, "i")
        },
        {
          data: new RegExp(search, "i")
        }
      ];
    }
    if (type) {
      condition.type = type;
    }
    Item.find(condition, null, {
      skip: from, // Starting Row
      limit: n, // Ending Row
      sort: {
        lastUpdateDate: -1 //Sort by Date Added DESC
      }
    }, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

async function getTotalNumbers(type, search) {
  return new Promise((resolve, reject) => {
    let condition = {};
    if (search) {
      condition['$or'] = [
        {
          keyw: new RegExp(search, "i")
        },
        {
          data: new RegExp(search, "i")
        }
      ];
    }
    if (type) {
      condition.type = type;
    }
    Item.count(condition, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

async function getItemAsync(keyw) {
  return new Promise((resolve, reject) => {
    Item.findOne({ keyw }, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

async function insertItemAsync(item) {
  item.lastUpdateDate = new Date();
  return new Promise((resolve, reject) => {
    Item.collection.insert([new Item(item)], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function updateItemAsync(keyw, item) {
  item.lastUpdateDate = new Date();
  if (item.keyw) {
    delete item.keyw;
  }
  return new Promise((resolve, reject) => {
    Item.update({ keyw }, item, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function deleteItemAsync(keyw) {
  return new Promise((resolve, reject) => {
    Item.remove({ keyw }, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

export {
  getItemsAsync,
  getTotalNumbers,
  getItemAsync,
  insertItemAsync,
  updateItemAsync,
  deleteItemAsync,
}