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
var checkTaskParam = function (req, res, next) {
    try {
        var userId = req.param("userId");
        var platformId = req.param("platformId");
        var taskId = req.param("taskId");
        var amount = req.param("amount");
        var taskName = req.param("taskName");
        if (!val.isNumeric(userId) || !val.isNumeric(platformId)
            || !taskId || !val.isNumeric(amount) || !taskName) {
            var ret = {result: false, data: "错误的参数"};
            res.json(400, ret);
        } else {
            next();
        }
    } catch (e) {
        console.error(e);
        res.json(500, {result: false, data: "未知的错误"});
    }
};

var getBalance = function (ret, userId) {
    return function (callback) {
        try {
            db.getBalanceByUid(userId, function (err, rows, fields) {
                if (!err) {
                    var balance = rows[0].balance || 0;
                    callback(null, balance);
                } else {
                    callback("db err", ret)
                }
            });
        } catch (e) {
            console.error(e);
        }
    }
};

var saveFinishTask = function (ret, userId, platformId, taskId, amount, taskName) {
    return function (callback) {
        db.saveFinishTask(userId, platformId, taskId, amount,
            taskName, function (err, rows, result) {
                if (err) {
                    ret.data = "发生错误";
                    callback("db err", ret);
                } else {
                    if (rows.insertId > 0) {
                        callback(null);
                    }
                }
            });
    }
};

var updateBalance = function (ret, userId, amount) {
    return function (callback) {
        db.updateBalanceByUid(userId, amount, function (err, rows, fields) {
            if (!err) {
                callback(null);
            } else {
                ret.data = "update balance err";
                callback("db err", ret);
            }
        });
    }
};

var updateStat = function (ret, userId, amount, taskId, taskName, platformId) {
    return function (balance, callback) {
        data.addTask({userId: userId, amount: amount, taskId: taskId,
            taskName: taskName, platformId: platformId, balance: parseInt(balance, 0)});
        ret.result = true;
        ret.data = "操作成功";
        callback(null, ret);
    }
};


router.post('/finish', checkTaskParam, auth, function (req, res) {
    var userId = req.param("userId");
    var platformId = req.param("platformId");
    var taskId = req.param("taskId");
    var amount = req.param("amount");
    var taskName = req.param("taskName");
    var ret = {result: false, data: null};
    async.waterfall([
        saveFinishTask(ret, userId, platformId, taskId, amount, taskName),
        updateBalance(ret, userId, amount),
        getBalance(ret, userId),
        updateStat(ret, userId, amount, taskId, taskName, platformId)
    ], function (err, result) {
        try {
            res.json(200, result);
        } catch (e) {
            console.error(e);
        }
    })
});

module.exports = router;
