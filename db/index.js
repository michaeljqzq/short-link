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

async function getItemAsync(key) {
  return new Promise((resolve, reject) => {
    Item.findOne({ key }, (err, res) => {
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

async function updateItemAsync(key, item) {
  item.lastUpdateDate = new Date();
  if(item.key) {
    delete item.key;
  }
  return new Promise((resolve, reject) => {
    Item.update({key}, item, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function deleteItemAsync(key) {
  return new Promise((resolve, reject) => {
    Item.remove({ key }, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

export {
  getItemAsync,
  insertItemAsync,
  updateItemAsync,
  deleteItemAsync,
}