import constant from '../constant';
const mongoose = require('mongoose');

let Item = mongoose.model('Item', new mongoose.Schema({
  keyw: { type: String, required: true, unique: true },
  data: String,
  file: Object,
  visit: {type: Number, default: 0},
  lastUpdateDate: Date,
  lastVisitDate: Date,
  type: { type: String, enum: constant.types, required: true },
}));

export default Item;