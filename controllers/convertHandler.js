const { restart, getObjectID, create, updateOne, getOne, getMany, del } = require ('./db');

const DELETED  = '[deleted]';
const SUCCESS  = 'success';
const INCORR   = 'incorrect password' 

exports.newThread = function (boardName, text, pass, cb) {
  let { hex, time } = getObjectID();
  create(
    boardName,
    {
      _id: hex,
      created_on: time,
      bumped_on: time,
      reported: false,
      text: text,
      replies: [],
      replycount: 0,
      delete_password: pass
    },
    data => {
      //console.log('newThread: ', boardName, '"'+text+'"', pass);
      cb(data)
    }
  )
}

exports.newReply = function (boardName, threadId, text, pass, cb) {
  let { hex, time } = getObjectID();
  updateOne(
    boardName,
    { _id: threadId },
    {
      $push: {
        replies: {
          _id: hex,
          created_on: time,
          bumped_on: time,
          reported: false,
          text: text,
          delete_password: pass
        }
      },
      $inc: { replycount: 1}
    },
    data => {
      //console.log('newReply: ', boardName, threadId, '"'+text+'"', pass);
      cb(data)
    }
  )
}

exports.getBumped = function (boardName, cb) {
  getMany(boardName, { $query: {}, $orderby: { bumped_on : 1 } }, data => {
    //console.log('getBumped: ', boardName);
    let result = data.slice(-10);
    cb(result.map(thread => {
      thread.replies = thread.replies.slice(-3).map(reply => {
        return {
          _id: reply._id,
          created_on: reply.created_on,
          bumped_on: reply.bumped_on,
          text: reply.text
        };
      });
      return {
        _id: thread._id,
        created_on: thread.created_on,
        bumped_on: thread.bumped_on,
        replies: thread.replies,
        replycount: thread.replies.length,
        text: thread.text
      };
    })
  )})
}

exports.getThread = function (boardName, threadId, cb) {
  getOne(boardName, threadId, thread => {
    //console.log('getThread: ', boardName, threadId, thread);
    thread.replies = thread.replies.map(reply => {
      return {
        _id: reply._id,
        created_on: reply.created_on,
        bumped_on: reply.bumped_on,
        text: reply.text
      };
    })
    cb({
      _id: thread._id,
      created_on: thread.created_on,
      bumped_on: thread.bumped_on,
      replies: thread.replies,
      replycount: thread.replycount,
      text: thread.text
    });
  })
}

exports.deleteThread = function (boardName, threadId, pass, cb) {
  del(boardName, {
    _id: threadId,
    delete_password: pass
  },
  data => {
    //console.log('deleteThread: ', boardName, threadId, pass);
    cb(data.deletedCount !== 0 ? "success" : 'incorrect password')
  })
}

exports.deleteReply = function (boardName, threadId, replyId, pass, cb) {
  getOne(boardName, threadId, data => {
    //console.log('deleteReply: ', boardName, threadId, replyId, pass);
    if (data && data.replies) {
      let hit = false;
      data.replies.forEach(ele => {
        if (ele._id === replyId && ele.delete_password === pass) {
          ele.text = DELETED;
          hit = true;
        }
      });
      if (hit) {
        updateOne(
          boardName,
          { _id: threadId },
          {
            $set: {
              replies: data.replies
            },
          },
          data => {
            //console.log('reportReply: ', data.result.ok, data.result.nModified, data.result.n);
            cb((data.result.ok === 1 && data.nModified !== 0) ? 'success' : 'error')
          }
        );
      }
      else {
        cb ('incorrect password');
      }
    }
    else {
      cb('incorrect id');
    }
  })
}

exports.reportThread = function (boardName, threadId, cb) {
    updateOne(
      boardName,
      { 
        _id: threadId
      },
      {
        $set: {
          reported: true
        },
      },
      data => {
        //console.log('reportReply: ', boardName, threadId);
        //console.log('reportReply: ', data.result.ok, data.result.nModified, data.result.n);
        cb((data.result.ok === 1 && data.result.nModified !== 0) ? 'reported' : 'error');
      }
    );
}

exports.reportReply = function (boardName, threadId, replyId, cb) {
  getOne(boardName, threadId, data => {
    //console.log('reportReply: ', boardName, threadId, replyId);
    if (data && data.replies) {
      let hit = false;
      data.replies.forEach(ele => {
        if (ele._id === replyId) {
          ele.reported = true;
          hit = true;
        }
      });
      if (hit) {
        updateOne(
          boardName,
          { _id: threadId },
          {
            $set: {
              replies: data.replies
            },
          },
          data => {
            //console.log('reportReply: ', data.result.ok, data.result.nModified, data.result.n);
            cb((data.result.ok === 1 && data.result.n !== 0) ? 'reported' : 'error')
          }
        );
      }
      else {
        cb('bad replyid');
      }
    }
    else {
      cb('bad threadid');
    }
  })
}
