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
            res.json(200, {result: false, msg: "需满10元才能取现"});
        } else if (account.balance >= payment) {
            db.askPayment(uid, account, payment, paymentType, function (err, rows, result) {
                if (err) {
                    next(err);
                    res.json(200, {result: false, msg: "申请支付失败，请稍后重试"})
                } else {
                    //TODO 发送邮件。
                    res.json(200, {result: true, id: result.insertId});
                }
            });
        } else {
            res.json(200, {result: false, msg: "超过可取现额度"});
        }
    });
});

module.exports = router;