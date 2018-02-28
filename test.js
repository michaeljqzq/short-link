import * as db from './db';

// db.insertItemAsync({
//   key: 'abc',
//   data: 'http://google3.com',
//   type: 'link'
// }).then(()=>{
//   console.log('finish');
// }).catch(e=>{
//   console.log(e.message)
// })

// db.updateItemAsync('abc',{
//   key: 'abc',
//   data: 'http://google3.com',
//   type: 'link'
// }).then(()=>{
//   console.log('finish');
// }).catch(e=>{
//   console.log(e.message)
// })

db.deleteItemAsync('abc').then(()=>{
  console.log('finish')
})