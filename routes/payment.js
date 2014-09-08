/**
 * Created by kun
 */
var express = require('express');
var router = express.Router();
var db = require('../db/mysql');
var auth = require('./authorization').authorize;
var data = require("../data_service/data");

router.post('/ask', auth, function (req, res) {
    try {
        var uid = req.get("mk_id");
        var account = req.param("account");
        var payment = req.param("payment") * 100;
        var paymentType = req.param("paymentType");
    } catch (e) {
        console.log(e);
        res.json(400, {result: false, msg: "未知的参数"});
        return;
    }
    db.getBalanceByUid(uid, function (err, rows, fields) {
        var balance = rows.length == 1 ? rows[0].balance : 0;
        var ret = {result: false, data: "发生错误"};
        //账户金额小于10元不能取现。
        if (balance < 1000) {
            ret.data = "账户余额不足10元，未满足最低取现额度";
            res.json(200, ret);
        } else if (balance >= payment) {
            db.askPayment(uid, account, payment, paymentType, function (err, rows, fields) {
                    if (err) {
                        res.json(200, ret);
                    } else {
                        if (!err) {
                            db.updateBalanceByUid(uid, -payment, function (err, rows, fields) {
                                    if (!err) {
                                        ret.result = true;
                                        ret.data = rows.insertId;
                                        res.json(200, ret);
                                        data.addPayment(
                                            {userId: uid, payment: payment, description: paymentType == 1 ? "手机充值" :
                                                "支付宝" + "取现" + payment / 100 + "元",
                                                balance: balance - payment
                                            }
                                        );
                                    } else {
                                        res.json(200, ret);
                                    }
                                }
                            );
                        } else {
                            res.json(200, ret);
                        }
                    }
                }
            );
        } else {
            res.json(200, {result: false, data: "超过可取现额度"});
        }
    });
})
;

module.exports = router;