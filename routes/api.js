/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const { newThread, newReply, getBumped, getThread, deleteThread, deleteReply, reportThread, reportReply } = require('../controllers/convertHandler');

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .post(function (req, res) {
      //console.log('/api/threads/:board: POST \nquery ',req.query,'\nparams',req.params,'\nbody  ',req.body,'\n');
      newThread(req.params.board, req.body.text, req.body.delete_password, data => {
        res.redirect('/b/'+req.params.board+'?_id='+data[0]._id);
      });
    }) 
    .put(function (req, res){
      //console.log('/api/threads/:board: put', req.query, req.params, req.body)
      reportThread(req.params.board, req.body.thread_id, data => {
        res.send(data)
      })
    }) 
    .get(function (req, res) {
      //console.log('/api/threads/:board: get', req.query, req.params, req.body)
      getBumped(req.params.board, data => {
        res.send(data)
      });
    }) 
    .delete(function (req, res) {
      //console.log('/api/threads/:board: delete all', req.query, req.params, req.body)
      deleteThread(req.params.board, req.body.thread_id, req.body.delete_password, data => {
        res.send(data)
      })
    }) 
    
  app.route('/api/replies/:board')
    .post(function (req, res) {
      //console.log('/api/replies/:board: post', req.query, req.params, req.body)
      newReply(req.params.board, req.body.thread_id, req.body.text, req.body.delete_password, data => {
        //res.send(data)
        res.redirect('/b/'+req.params.board+'/'+req.body.thread_id);
      });
    }) 
    .put(function (req, res) {
      //console.log('/api/replies/:board: put', req.query, req.params, req.body)
      reportReply(req.params.board, req.body.thread_id, req.body.reply_id, data => {
        res.send(data)
      });
    }) 
    .get(function (req, res) {
      //console.log('/api/replies/:board: get', req.query, req.params, req.body)
      getThread(req.params.board, req.query.thread_id, data => {
        res.send(data)
      })
    }) 
    .delete(function (req, res){ 
      //console.log('/api/replies/:board: delete', req.query, req.params, req.body);
      deleteReply (req.params.board, req.body.thread_id, req.body.reply_id, req.body.delete_password, data => {
        res.send(data)
      });
    }) 
}
