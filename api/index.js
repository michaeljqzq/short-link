import express from 'express';
import bodyParser from 'body-parser';
import cfg from '../util';
import * as db from '../db';
import constant from '../constant';
import multer from 'multer';
import path from 'path';
// import auth from 'basic-auth';
import passport from 'passport';
import { Strategy } from 'passport-local';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const app = express();
app.use(bodyParser());

let upload = multer({ dest: cfg.uploadFoler });

app.use(cookieParser());
app.use(session({ secret: cfg.session_secret, cookie: { maxAge: 60000 } }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new Strategy({
  usernameField: 'email',
  passwordField: 'password'
}, (username, password, done) => {
  if (username === cfg.username && password === cfg.password) {
    return done(null, username);
  } else {
    return done(null, false);
  }
}));

passport.serializeUser(function (user, done) {//保存user对象
  done(null, user);//可以通过数据库方式操作
});

passport.deserializeUser(function (user, done) {//删除user对象
  done(null, user);//可以通过数据库方式操作
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}

function isApiLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.sendStatus(401);
}

// function basicAuth(req, res, next) {
//   if (!cfg.debug) {
//     let credentials = auth(req);
//     if (!credentials || credentials.name !== cfg.username || credentials.pass !== cfg.password) {
//       res.statusCode = 401
//       res.setHeader('WWW-Authenticate', 'Basic realm="example"')
//       res.end('Access denied');
//       return;
//     }
//   }
//   next();
// }


app.get('/api', isApiLoggedIn, async (req, res) => {
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

app.get('/api/:keyw', isApiLoggedIn, async (req, res) => {
  let keyw = req.params.keyw;
  let result = await db.getItemAsync(keyw);
  if (!result) {
    res.status(404).send('Short link not found');
    return;
  }
});

app.post('/api/:keyw', isApiLoggedIn, upload.single('file'), async (req, res) => {
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

app.delete('/api/:keyw', isApiLoggedIn, async (req, res) => {
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

app.use('/', isLoggedIn, express.static(path.resolve(__dirname, 'web')));

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