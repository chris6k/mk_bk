/**
 * Created by kun
 */
var express = require('express');
var router = express.Router();
var db = require('../db/mysql');
var auth = require('./authorization').authorize;

router.get('/info', auth, function (req, res) {
    db.getAccountInfo(req.param('uid'), function (err, rows, result) {
        var ret = {result: false, data: null};
        if (err) {
            next(err);
            res.json(200, ret)
        } else {
            ret.result = true;
            ret.data = result;
            res.json(200, ret);
        }
    });
});

router.get('/reg', function (req, res) {
    db.regUser(req.param("user_id"), req.param("i_hash"), function (err, rows, result) {
        var ret = {result: false, data: null};
        if (!err) {
            ret.result = true;
            ret.data = result;
        } else {
            ret.data = "无法注册该用户";
        }
        res.json(200, ret);
    });
});

module.exports = router;
