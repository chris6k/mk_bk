var db = require("../db/mysql");
module.exports.addInviteComm = function (inviteComm) {
    console.info("start save inviteComm, inviteComm => " + inviteComm);
    db.updateBalanceByUid(inviteComm.userId, inviteComm.inviteComm, function (err, rows, fields) {
        if (err) {
            console.error(err);
        }
    });
    //插入用户总表
    db.insertOrUpdateUserTotal(inviteComm.userId, inviteComm.inviteComm, new Date(), inviteComm.inviteComm, 0, 0, function (err, rows, fields) {
        if (err) {
            console.error(err);
        }
    });
    //插入用户支出表
    db.insertOrUpdateUserBilling(inviteComm.userId, "好友分成", inviteComm.inviteComm, 0, parseInt(inviteComm.balance, 0) + inviteComm.inviteComm
        , new Date(),
        function (err, rows, fields) {
            if (err) {
                console.error(err);
            }
        });
    //插入用户日常表
    db.insertOrUpdateUserDaily(inviteComm.userId, inviteComm.inviteComm, 0, 0, new Date(), 0, inviteComm.inviteComm,
        function (err, rows, fields) {
            if (err) {
                console.error(err);
            }
        }
    );
};
module.exports.addTask = function (task) {
    console.info("start save task, task => " + task);
    //插入用户支出表
    db.insertOrUpdateUserBilling(task.userId, task.taskName, task.amount, 0, task.balance
        , new Date(),
        function (err, rows, fields) {
            if (err) {
                console.error(err);
            }
        });
    //更新用户日常统计
    db.getAccountInfo(task.userId, function (err, rows, fields) {
            if (!err || rows.length == 0) {
                var inviteComm = 0;
                if (rows[0].inviteUserId) {
                    inviteComm = task.amount * 0.2;
                    exports.addInviteComm({userId: rows[0].inviteUserId, inviteComm: inviteComm, balance: rows[0].balance});
                }
                db.insertOrUpdateUserDaily(task.userId, parseInt(task.amount, 0), 1, 0, new Date(), task.amount * 0.7, 0,
                    function (err, rows, fields) {
                        if (err) {
                            console.error(err);
                        }
                    }
                );
            }
            else {
                console.error(err || "没有找到uid[" + task.userId + "]对应的用户记录");
            }
        }
    );
    //插入用户总表
    db.insertOrUpdateUserTotal(task.userId, task.amount, new Date(), task.amount, 1, 0, function (err, rows, fields) {
        if (err) {
            console.error(err);
        }
    });
    //插入平台支出表
    db.insertOrUpdatePlatformBilling(task.platformId, task.taskName, 0, task.amount, task.balance, new Date(),
        function (err, rows, fields) {
            if (err) {
                console.error(err);
            }
        });
    //插入管理员统计表
    db.insertOrUpdateAdminDaily(task.platformId, task.amount, 1, new Date(), task.amount * 0.7,
        function (err, rows, fields) {
            if (err) {
                console.error(err);
            }
        });
};


module.exports.addPayment = function (payment) {
    console.info("start save payment, payment => " + payment);
    //插入用户billing表
    db.insertOrUpdateUserBilling(payment.userId, payment.description, 0, payment.payment, payment.balance
        , new Date(),
        function (err, rows, fields) {
            if (err) {
                console.error(err);
            }
        });
    //插入总表
    db.insertOrUpdateUserTotal(payment.userId, 0, new Date(), -payment.payment, 0, 0, function (err, rows, fields) {
        if (err) {
            console.error(err);
        }
    })
};




