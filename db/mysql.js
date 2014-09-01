/**
 * Created by kun on 2014/8/12.
 */
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'mk_admin',
    password: '111111'
});


/**
 * 获取好友信息
 * @param uid
 * @param callback
 */
module.exports.getFriends = function (uid, callback) {
    pool.query('select INVITE_COUNT friendCount, LAST_MONTH_FRIENDS_COMMISSION lastMonthCommission from accounts where invite_user_id = ?', [uid], function (err, rows, fields) {
        callback(err, rows, fields);
    });
};

/**
 * 获取好友排名
 * @param callback
 */
module.exports.getFriendsRank = function (callback) {
    pool.query('select INVITE_COUNT friendCount, LAST_MONTH_FRIENDS_COMMISSION lastMonthCommission from accounts order by friendCount, lastMonthCommission desc limit 0,3', function (err, rows, fields) {
        callback(err, rows, fields);
    });
};

/**
 * 获取账户信息
 * @param uid
 * @param callback
 */
module.exports.getAccountInfo = function (uid, callback) {
    pool.query('select id, i_hash iHash, invite_user_id inviteUserId, task_count taskCount, invite_count inviteCount, last_month_friends_commission, balance from account where id = ?', [uid], function (err, rows, fields) {
        callback(err, rows, fields);
    });
};

module.exports.getBalanceByUid = function (uid, callback) {
    pool.query("select balance from account where id = ?", [uid], function (err, rows, fields) {
        callback(err, rows, fields);
    });
};

module.exports.updateLastMonthFriendsComm = function (uid, lastComm, callback) {
    pool.query('update account set LAST_MONTH_FRIENDS_COMMISSION = ? where ID = ?', [lastComm, uid],
        function (err, rows, fields) {
            callback(err, rows, fields);
        });
};

/**
 * 注册用户
 * @param userId
 * @param iHash
 * @param callback
 */
module.exports.regUser = function (userId, iHash, callback) {
    pool.query('insert into account(invite_user_id, i_hash, created_at, task_count, invite_count, balance) values(?,?,?,?,?,?)'
        , [userId ? userId : 0, iHash, new Date(), 0, userId ? 1 : 0, 0], function (err, rows, fields) {
            callback(err, rows, fields);
        });
}

/**
 * 获取账目
 * @param userId
 * @param index
 * @param count
 * @param callback
 */
module.exports.getBillingList = function (userId, index, count, callback) {
    pool.query("select ID id, USER_ID useId, DESCRIPTION description,  DEBIT debit, CREDIT credit, CREATED_AT dateDay from user_billing where user_id = ? limit ?,?", [userId, index || 0, count || 10], function (err, rows, fields) {
        callback(err, rows, fields);
    });
};

/**
 * 插入支付请求
 * @param userId
 * @param payment
 * @param paymentType
 * @param callback
 */
module.exports.askPayment = function (userId, account, payment, paymentType, callback) {
    pool.query("insert into user_settlement(USER_ID,ACCOUNT_ID, PAYMENT,DATE_DAY,PAYMENT_TYPE,STATE)values(?,?,?,?,?)",
        [userId, account, payment, new Date(), paymentType, 0],
        function (err, rows, fields) {
            callback(err, rows, fields);
        }
    );
};

module.exports.saveFinishTask = function (userId, platformId, taskId, amount, taskName, callback) {
    pool.query("insert into task(name, user_id, created_at, platform_id, unit, state) values(?,?,?,?,?,?)"),
        [taskName, userId, new Date(), platformId, amount, 1],
        function (err, rows, fields) {
            callback(err, rows, fields);
        }
};


