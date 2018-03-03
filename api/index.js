import express from 'express';
import bodyParser from 'body-parser';
import cfg from '../util';
import * as db from '../db';
import constant from '../constant';
import multer from 'multer';
import path from 'path';

const app = express();
app.use(bodyParser());
let upload = multer({ dest: cfg.uploadFoler })

// app.get('/' + cfg.manageModule, (req, res) => {

// });

app.get('/api', async (req, res) => {
  // console.log('in get api');
  let firstQuery = req.query.page === undefined;
  let page = req.query.page || 0;
  let type = req.query.type;
  let search = req.query.search;
  let totalNumber;
  if (firstQuery) {
    totalNumber = db.getTotalNumbers(type, search);
  }
  try {
    let results = await db.getItemsAsync(page * constant.itemsPerPage, constant.itemsPerPage, type, search);
    let returnResult = {
      success: true,
      data: results,
    };
    if (firstQuery) {
      returnResult.total = await totalNumber;
    }
    res.json(returnResult);
    // console.log('success get api');
    return;
  } catch (e) {
    // console.log('error get api');
    res.json({
      success: false,
      error: e.message
    });
    return;
  }
});

app.get('/api/:keyw', async (req, res) => {
  let keyw = req.params.keyw;
  let result = await db.getItemAsync(keyw);
  if (!result) {
    res.status(404).send('Short link not found');
    return;
  }
});

app.post('/api/:keyw', upload.single('file'), async (req, res) => {
  let keyw = req.params.keyw;
  let item = req.body;
  console.log(item)
  console.log(req.file);
  if(!item.data && req.file) {
    item.file = req.file;
  }
  let result = await db.getItemAsync(keyw);
  if (!result) {
    item.keyw = keyw;
    try {
      await db.insertItemAsync(item);
    } catch (e) {
      res.json({
        success: false,
        error: e.message
      });
      return;
    }
    res.json({
      success: true
    });
    return;
  } else {
    try {
      await db.updateItemAsync(keyw, item);
    } catch (e) {
      res.json({
        success: false,
        error: e.message
      });
      return;
    }
    res.json({
      success: true
    });
    return;
  }
});

app.delete('/api/:keyw', async (req, res) => {
  let keyw = req.params.keyw;
  let result = await db.deleteItemAsync(keyw);
  if (!result) {
    res.json({
      success: false,
      error: 'keyw not found'
    })
    return;
  }
  res.json({
    success: true
  });
});

app.get('/:keyword', async (req, res) => {
  try {
    let result = await db.getItemAsync(req.params.keyword);
    if (!result) {
      res.status(404).send('Short link not found');
      return;
    }
    if (result.type === 'link') {
      res.redirect(result.data);
      res.end();
      return;
    }else if (result.type === 'file') {
      // console.log(path.resolve(__dirname, result.file.path))
      // console.log(require('fs').existsSync(path.resolve(__dirname, result.file.path)));
      res.download(result.file.path, result.file.originalname);
      // res.end();
      return;
    }
  } catch (e) {
    res.status(404).send(e.message);
    return;
  }
});

app.listen(cfg.apiPort, null, null, () => {
  console.log('listening on ' + cfg.apiPort);
});