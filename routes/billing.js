/**
 * Created by kun
 */
var express = require('express');
var router = express.Router();
var db = require('../db/mysql');
var auth = require('./authorization').authorize;

router.get('/list', auth, function (req, res) {
    db.getBillingList(req.param('uid'), req.param('idx'), req.param('total'), function (err, data) {
        if (err) {
            next(err);
            res.json(200, {result: false})
        } else {
            res.json(200, {result: false, data: data});
        }
    });
});

module.exports = router;