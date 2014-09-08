/**
 * Created by kun
 */
var express = require('express');
var router = express.Router();
var db = require('../db/mysql');
var auth = require('./authorization').authorize;

router.get('/ask', auth, function (req, res) {
    var uid = req.get("mk_id");
    var account = req.param("account");
    var payment = req.param("payment");
    var paymentType = req.param("paymentType");
    db.getBalanceByUid(uid, function (err, rows, account) {
        //账户金额小于10元不能取现。
        if (account.balance < 1000) {
            res.json(200, {result: false, data: "需满10元才能取现"});
        } else if (account.balance >= payment) {
            db.askPayment(uid, account, payment, paymentType, function (err, rows, fields) {
                if (err) {
                    res.json(200, {result: false, data: "发生错误"});
                } else {
                    if (rows.length > 0) {
                        res.json(200, {result: true, data: rows.insertId});
                    } else {
                        res.json(200, {result: true, data: 0});
                    }
                }
            });
        } else {
            res.json(200, {result: false, data: "超过可取现额度"});
        }
    });
});

module.exports = router;