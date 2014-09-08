/**
 * Created by kun
 */
var express = require('express');
var router = express.Router();
var db = require('../db/mysql');
var auth = require('./authorization').authorize;

router.get('/finish', auth, function (req, res) {
    db.saveFinishTask(req.param('userId'), req.param('platformId'), req.param('taskId'), req.param('amount'),
        req.param('taskName'), function (err, rows, result) {
            var ret = {result: false, data: null};
            if (err) {
                ret.data = "发生错误";
            } else {
                ret.result = true;
                if (rows.length > 0) {
                    ret.data = rows.insertId;
                } else {
                    ret.data = 0;
                }
            }
            res.json(200, ret);
        });
});

module.exports = router;
