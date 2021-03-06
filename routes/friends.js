/**
 * Created by kun
 */
var express = require('express');
var router = express.Router();
var db = require('../db/mysql');
var auth = require('./authorization').authorize;

router.get('/info', auth, function (req, res) {
    db.getFriends(req.params.id, function (err, rows, result) {
        if (err) {
            res.json(200, {result: false, data: "发生错误"});
        } else {
            if (rows.length > 0) {
                res.json(200, {result: true, data: rows});
            } else {
                res.json(200, {result: true, data: {}});
            }
        }
    });
});

router.get('/rank', auth, function (req, res) {
    db.getFriendsRank(function (err, rows, result) {
        if (err) {
            res.json(200, {result: false, data: "发生错误"});
        } else {
            if (rows.length > 0) {
                res.json(200, {result: true, data: rows});
            } else {
                res.json(200, {result: true, data: {}});
            }
        }
    });
});

module.exports = router;
