import express from 'express';
import bodyParser from 'body-parser';
import cfg from '../util';
import * as db from '../db';

const app = express();
app.use(bodyParser.json());

app.get('/' + cfg.manageModule, (req, res) => {

});

app.get('/api/:key', async (req, res) => {
  let key = req.params.key;
  let result = await db.getItemAsync(key);
  if(!result) {
    res.status(404).send('Short link not found');
    return;
  }
  console.log(result);
});

app.post('/api/:key', async (req, res) => {
  let key = req.params.key;
  let item = req.body;
  console.log(item)
  let result = await db.getItemAsync(key);
  if(!result) {
    item.key = key;
    try{
      await db.insertItemAsync(item);
    }catch(e) {
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
  }else {
    try{
      await db.updateItemAsync(key, item);
    }catch(e) {
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

app.delete('/api/:key', async (req, res) => {
  let key = req.params.key;
  let result = await db.deleteItemAsync(key);
  if(!result) {
    res.json({
      success: false,
      error: 'key not found'
    })
    return;
  }
  res.json({
    success:true
  });
});

app.listen(cfg.apiPort, null, null, () => {
  console.log('listening on ' + cfg.apiPort);
});