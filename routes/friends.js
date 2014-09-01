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
            next(err);
        } else {
            res.json(200, result);
        }
    });
});

router.get('/rank', auth, function (req, res) {
    db.getFriendsRank(function (err, rows, result) {
        if (err) {
            next(err);
        } else {
            res.json(200, result);
        }
    });
});

module.exports = router;
