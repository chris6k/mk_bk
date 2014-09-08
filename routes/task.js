/**
 * Created by kun
 */
var express = require('express');
var router = express.Router();
var db = require('../db/mysql');
var auth = require('./authorization').authorize;
var data = require("../data_service/data");

router.post('/finish', auth, function (req, res) {
    var userId = req.param("userId");
    var platformId = req.param("platformId");
    var taskId = req.param("taskId");
    var amount = req.param("amount");
    var taskName = req.param("taskName");
    db.getBalanceByUid(userId, function (err, rows, fields) {
        if (!err) {
            var balance = rows[0].balance || 0;

            db.saveFinishTask(userId, platformId, taskId, amount,
                taskName, function (err, rows, result) {
                    var ret = {result: false, data: null};
                    if (err) {
                        ret.data = "发生错误";
                    } else {
                        if (rows.insertId > 0) {
                            //更新用户account表
                            db.updateBalanceByUid(userId, amount, function (err, rows, fields) {
                                if (!err) {
                                    ret.result = true;
                                    ret.data = rows.insertId;
                                } else {
                                    console.error(err);
                                }
                                res.json(200, ret);
                            });
                            data.addTask({userId: userId, amount: amount, taskId: taskId,
                                taskName: taskName, platformId: platformId, balance: parseInt(balance, 0) + parseInt(amount, 0)});
                            return;
                        } else {
                            ret.data = 0;
                        }
                    }
                    res.json(200, ret);
                });
        } else {
            res.json(400, {result: false, data: "未知的用户"});
        }
    });
});

module.exports = router;
