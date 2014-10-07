/**
 * Created by kun
 */
var express = require('express');
var router = express.Router();
var db = require('../db/mysql');
var auth = require('./authorization').authorize;
var data = require("../data_service/data");
var async = require("async");
var val = require("validator");

var checkPaymentParam = function (req, res, next) {
    try {
        var uid = req.get("mk_id");
        var account = req.param("account");
        var payment = req.param("payment");
        var paymentType = req.param("paymentType");
        if (val.isNumeric(uid)
            && val.isNumeric(payment)
            && account && paymentType) {
            next();
            return;
        }
    } catch (e) {
        console.error(e);
    }
    res.status(400).json({result: false, msg: "未知的参数"});
}

/**
 * 获取当前余额
 * @param ret
 * @param uid
 * @param payment
 * @returns {Function}
 */
var getBalance = function (ret, uid, payment) {
    return function (callback) {
        db.getBalanceByUid(uid, function (err, rows, fields) {
            var balance = rows.length == 1 ? rows[0].balance : 0;
            //账户金额小于10元不能取现。
            if (balance < 1000) {
                ret.data = "账户余额不足10元，未满足最低取现额度";
                callback("balance less than 10 yuan", ret);
            } else if (balance < payment) {
                ret.data = "超过余额";
                callback("balance less than payment", ret);
            } else {
                callback(null, balance);
            }
        })
    }
};

/**
 * 更新余额
 * @param ret
 * @param uid
 * @param payment
 * @returns {Function}
 */
var updateBalance = function (ret, uid, payment) {
    return function (balance, callback) {
        db.updateBalanceByUid(uid, -1 * payment, function (err, rows, fields) {
                if (!err) {
                    callback(null, balance);
                } else {
                    ret.data = "更新余额失败";
                    callback("db err", ret);
                }
            }
        );
    }
}

/**
 * 添加支付记录
 * @param ret
 * @param uid
 * @param account
 * @param payment
 * @param paymentType
 * @returns {Function}
 */
var askPayment = function (ret, uid, account, payment, paymentType) {
    return function (balance, callback) {
        db.askPayment(uid, account, payment, paymentType, function (err, rows, fields) {
                if (err) {
                    ret.data = "添加支付记录失败";
                    callback("db err", ret);
                } else {
                    callback(null, balance);
                }
            }
        );
    }
};

/**
 * 添加统计信息
 * @param ret
 * @param uid
 * @param payment
 * @param paymentType
 * @returns {Function}
 */
var addPayment = function (ret, uid, payment, paymentType) {
    return function (balance, callback) {
        data.addPayment(
            {userId: uid, payment: payment, description: paymentType == 1 ? "手机充值" :
                "支付宝" + "取现" + payment / 100 + "元",
                balance: balance - payment
            }
        );
        ret.result = true;
        ret.data = balance - payment;
        callback(null, ret);
    }
}


router.post('/ask', auth, checkPaymentParam, function (req, res) {
    var ret = {result: false, data: "发生错误"};
    var uid = req.param("uid");
    var payment = req.param("payment") * 100;
    var account = req.param("account");
    var paymentType = req.param("paymentType");


    async.waterfall([
        getBalance(ret, uid, payment),
        askPayment(ret, uid, account, payment, paymentType),
        updateBalance(ret, uid, payment),
        addPayment(ret, uid, payment, paymentType)
    ], function (err, result) {
        res.json(200, result);
    });
});

module.exports = router;