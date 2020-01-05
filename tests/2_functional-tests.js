/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  let lastId,
      lastReplyId,
      testId = '5dcaa245dcdb310089c4d639',
      testReplyId = '5dcabac15904502a3f236fc9',
      testBoard = 'fcc',
      testPassword = 'thePASSwrd'

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('1 new thread', function (done) {

        let arg = { text: 'text and more', delete_password: testPassword }

        chai.request(server)
        .post('/api/threads/' + testBoard)
        .set('content-type', 'application/json; charset=utf-8')
        .send(arg)
        .end(function(err, res) {
          if (err) throw(err);
          lastId = res.res.connection._httpMessage.path.split('=')[1];
          assert.equal(res.status, 200, 'Status must be 200');
          assert.property(arg, 'delete_password', 'There should be a property called "delete_password"')
          assert.equal(res.header['content-type'], 'text/html; charset=UTF-8', 'Wrong type/charset !');
          assert.isAbove(res.text.length, 0, 'The "text" is empty !');
          done();
        });
      });
    });

    suite('GET', function() {

      test('1 get maximum 10 threads with maximum 3 replies', function (done) {
        chai.request(server)
        .get('/api/threads/' + testBoard)
        .end(function(err, res){
          if (err) throw(err);
          assert.equal(res.status, 200, 'Status must be 200');
          assert.equal(res.header['content-type'], 'application/json; charset=utf-8', 'Wrong type/charset !');
          assert.isAbove(res.text.length, 0, 'The body is empty !');
          assert.isArray(res.body, 'The body must be an array !');
          res.body.forEach((ele, i) => {
            assert.property(ele, '_id', 'Thread: there must be a property called "_id"');
            assert.property(ele, 'created_on', 'Thread: there must be a property called "created_on"');
            assert.property(ele, 'bumped_on', 'Thread: there must be a property called "bumped_on"');
            assert.property(ele, 'replies', 'Thread: there must be a property called "replies"');
            assert.property(ele, 'replycount', 'Thread: there must be a property called "replycount"');
            assert.property(ele, 'text', 'Thread: there must be a property called "replycount"');

            assert.isString(ele._id, 'Thread: the property called "_id" must be of type string');
            assert.isString(ele.created_on, 'Thread: the property called "created_on" must be of type string');
            assert.isString(ele.bumped_on, 'Thread: the property called "bumped_on" must be of type string');
            assert.isArray(ele.replies, 'Thread: the property called "replies" must be of type array');
            assert.isNumber(ele.replycount, 'Thread: the property called "replycount" must be of type number');
            assert.isString(ele.text, 'Thread: the property called "text" must be of type string');
            
            assert.equal(ele.replycount, ele.replies.length, 'The length of the "replies" array must be equal to the "replycount"')
            ele.replies.forEach(sele => {
              assert.isObject(sele, 'Reply: the reply must be an object !');
              assert.property(sele, '_id', 'Reply: there must be a property called "_id"');
              assert.property(sele, 'created_on', 'Reply: there must be a property called "created_on"');
              assert.property(sele, 'bumped_on', 'Reply: there must be a property called "bumped_on"');
              assert.property(sele, 'text', 'Reply: there must be a property called "replycount"');

              assert.isString(sele._id, 'Reply: the property called "_id" must be of type string');
              assert.isString(sele.created_on, 'Reply: the property called "created_on" must be of type string');
              assert.isString(sele.bumped_on, 'Reply: the property called "bumped_on" must be of type string');
              assert.isString(sele.text, 'Reply: the property called "text" must be of type string');
            });
          });
          done();
        });
      });
    });

    suite('PUT', function() {

      test('1 report thread, bad id', function (done) {
        chai.request(server)
        .put('/api/threads/' + testBoard)
        .send({ thread_id: lastId+'bad' })
        .end(function(err, res){
          if (err) throw(err);
          assert.equal(res.status, 200, 'Status must be 200');
          assert.equal(res.header['content-type'], 'text/html; charset=utf-8', 'Wrong type/charset !');
          assert.equal(res.text, 'error', 'The id should be incorrect !')
          done();
        });
      });

      test('2 report thread, id ok', function (done) {
        chai.request(server)
        .put('/api/threads/' + testBoard)
        .send({ thread_id: lastId })
        .end(function(err, res){
          if (err) throw(err);
          assert.equal(res.status, 200, 'Status must be 200');
          assert.equal(res.header['content-type'], 'text/html; charset=utf-8', 'Wrong type/charset !');
          assert.equal(res.text, 'reported', 'An incorrect id was given !')
          done();
        });
      });
    });

    suite('DELETE', function() {
      
      test('1 delete thread, bad password', function (done) {

        let arg = { thread_id: lastId, delete_password: 'badpassword' }
        
        chai.request(server)
        .delete('/api/threads/' + testBoard)
        .send(arg)
        .end(function(err, res){
          if (err) throw(err);
          assert.equal(res.status, 200, 'Status must be 200');
          assert.equal(res.header['content-type'], 'text/html; charset=utf-8', 'Wrong type/charset !');
          assert.property(arg, 'delete_password', 'There should be a property called "delete_password"')
          assert.equal(res.text, 'incorrect password', 'This password should be incorrect !');
          done();
        });
      });
      
      test('2 delete thread, password ok', function (done) {

        let arg = { thread_id: lastId, delete_password: testPassword }
        
        chai.request(server)
        .delete('/api/threads/' + testBoard)
        .send(arg)
        .end(function(err, res){
          if (err) throw(err);
          assert.equal(res.status, 200, 'Status must be 200');
          assert.equal(res.header['content-type'], 'text/html; charset=utf-8', 'Wrong type/charset !');
          assert.property(arg, 'delete_password', 'There should be a property called "delete_password"')
          assert.equal(res.text, 'success', 'This password should be correct !');
          done();
        });
      });
    });

  });

  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {

      test('1 new reply', function (done) {

        let arg = { thread_id: testId, text: 'only to show it\'s been possible' , delete_password: testPassword }

        chai.request(server)
        .post('/api/replies/' + testBoard)
        .set('content-type', 'application/json; charset=UTF-8')
        .send(arg)
        .end(function(err, res) {
          if (err) throw(err);
          assert.equal(res.status, 200, 'Status must be 200');
          assert.property(arg, 'delete_password', 'There should be a property called "delete_password"')
          assert.isAbove(res.text.length, 0, 'The body is empty !');
          done();
        });
      });

    });

    suite('GET', function(done) {
      
      test('1 get all replies of one thread', function (done) {
        chai.request(server)
        .get('/api/replies/' + testBoard)
        .set('content-type', 'application/json; charset=UTF-8')
        .query({ thread_id: testId })
        .end(function(err, res) {
          if (err) throw(err);          
          assert.equal(res.status, 200, 'Status must be 200');
          assert.isAbove(res.text.length, 0, 'The body is empty !');
          assert.isObject(res.body, 'The thread must be an object !');
          assert.property(res.body, '_id', 'Thread: there must be a property called "_id"');
          assert.property(res.body, 'created_on', 'Thread: there must be a property called "created_on"');
          assert.property(res.body, 'bumped_on', 'Thread: there must be a property called "bumped_on"');
          assert.property(res.body, 'replies', 'Thread: there must be a property called "replies"');
          assert.property(res.body, 'replycount', 'Thread: there must be a property called "replycount"');
          assert.property(res.body, 'text', 'Thread: there must be a property called "replycount"');

          assert.isString(res.body._id, 'Thread: the property called "_id" must be of type string');
          assert.isString(res.body.created_on, 'Thread: the property called "created_on" must be of type string');
          assert.isString(res.body.bumped_on, 'Thread: the property called "bumped_on" must be of type string');
          assert.isArray(res.body.replies, 'Thread: the property called "replies" must be of type array');
          assert.isNumber(res.body.replycount, 'Thread: the property called "replycount" must be of type number');
          assert.isString(res.body.text, 'Thread: the property called "text" must be of type string');

          assert.equal(res.body.replycount, res.body.replies.length, 'The length of the "replies" array must be equal to the "replycount"')
          res.body.replies.forEach(ele => {
            assert.isObject(ele, 'Reply: the reply must be an object !');
            assert.property(ele, '_id', 'Reply: there must be a property called "_id"');
            assert.property(ele, 'created_on', 'Reply: there must be a property called "created_on"');
            assert.property(ele, 'bumped_on', 'Reply: there must be a property called "bumped_on"');
            assert.property(ele, 'text', 'Reply: there must be a property called "replycount"');

            assert.isString(ele._id, 'Reply: the property called "_id" must be of type string');
            assert.isString(ele.created_on, 'Reply: the property called "created_on" must be of type string');
            assert.isString(ele.bumped_on, 'Reply: the property called "bumped_on" must be of type string');
            assert.isString(ele.text, 'Reply: the property called "text" must be of type string');
          });
          done();
        });
      });

    });
    
    suite('PUT', function() {
      test('2 report thread, id ok', function (done) {
        chai.request(server)
        .put('/api/replies/' + testBoard)
        .send({ thread_id: testId, reply_id: testReplyId })
        .end(function(err, res){
          if (err) throw(err);
          assert.equal(res.status, 200, 'Status must be 200');
          assert.equal(res.header['content-type'], 'text/html; charset=utf-8', 'Wrong type/charset !');
          assert.equal(res.text, 'reported', 'Something went wrong !')
          done();
        });
      });

    });

    suite('DELETE', function() {

      test('1 delete reply, password ok', function (done) {

        let arg = { thread_id: testId, reply_id: testReplyId, delete_password: testPassword }
        
        chai.request(server)
        .delete('/api/replies/' + testBoard)
        .send(arg)
        .end(function(err, res){
          if (err) throw(err);
          assert.equal(res.status, 200, 'Status must be 200');
          assert.equal(res.header['content-type'], 'text/html; charset=utf-8', 'Wrong type/charset !');
          assert.property(arg, 'delete_password', 'There should be a property called "delete_password"')
          assert.equal(res.text, 'success', 'This password should be correct !');
          done();
        });
      });
    });
  });

});
