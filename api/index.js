import express from 'express';
import bodyParser from 'body-parser';
import cfg from '../util';
import * as db from '../db';
import constant from '../constant';
import multer from 'multer';
import path from 'path';
import passport from 'passport';
import passportJWT from 'passport-jwt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

let upload = multer({ dest: cfg.uploadFoler });

app.use(passport.initialize());

let jwtOptions = {
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: cfg.jwtSecret,
}

let jwtStrategy = new passportJWT.Strategy(jwtOptions, (jwt_payload, next) => {
  if (jwt_payload.username === cfg.username) {
    next(null, cfg.username);
  } else {
    next(null, false);
  }
});

passport.use(jwtStrategy);

app.post(`/${constant.loginPath}`, (req, res) => {
  let { username, password } = req.body;
  console.log(username,password)
  if(username === cfg.username && password === cfg.password) {
    let token = jwt.sign({username}, jwtOptions.secretOrKey);
    res.json({
      token
    });
  }else {
    res.status(401).end();
  }
});

let auth = passport.authenticate('jwt', {session:false});

app.get(`/${constant.apiPath}`, auth, async (req, res) => {
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
    results = results.map(r => {
      if (r.type === 'link') return r;
      if (r.type === 'file') {
        r.data = r.file.originalname;
        delete r.file;
        return r;
      }
    })
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

app.get(`/${constant.apiPath}:keyw`, auth, async (req, res) => {
  let keyw = req.params.keyw;
  let result = await db.getItemAsync(keyw);
  if (!result) {
    res.status(404).send('Short link not found');
    return;
  }
});

app.post(`/${constant.apiPath}:keyw`, auth, upload.single('file'), async (req, res) => {
  let keyw = req.params.keyw;
  let item = req.body;
  console.log(item)
  console.log(req.file);
  if (!item.data && req.file) {
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

app.delete(`/${constant.apiPath}:keyw`, auth, async (req, res) => {
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

app.use('/', express.static(path.resolve(__dirname, 'web')));
app.get(`/${constant.reactLoginPath}`, (req,res)=>{
  res.sendFile(path.resolve(__dirname, 'web', 'index.html'));
})

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
    } else if (result.type === 'file') {
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