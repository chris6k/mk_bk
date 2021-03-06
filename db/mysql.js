/**
 * Created by kun on 2014/8/12.
 */
var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'mk_admin',
    password: '111111',
    database: "mk_db"
});


/**
 * 获取好友信息
 * @param uid
 * @param callback
 */
module.exports.getFriends = function (uid, callback) {
    pool.query('select INVITE_COUNT friendCount, LAST_MONTH_FRIENDS_COMMISSION lastMonthCommission from accounts  ' +
        'where invite_user_id = ?', [uid], callback);
};

/**
 * 获取好友排名
 * @param callback
 */
module.exports.getFriendsRank = function (callback) {
    pool.query('select INVITE_COUNT friendCount, LAST_MONTH_FRIENDS_COMMISSION lastMonthCommission from  ' +
        ' accounts order by friendCount, lastMonthCommission desc limit 0,3', callback);
}
;

/**
 * 获取账户信息
 * @param uid
 * @param callback
 */
module.exports.getAccountInfo = function (uid, callback) {
    pool.query('select id, i_hash iHash, invite_user_id inviteUserId, ' +
            'task_count taskCount, invite_count inviteCount, last_month_friends_commission, balance from account where id = ?',
        [uid], callback);
};

module.exports.getBalanceByUid = function (uid, callback) {
    pool.query("select balance from account where id = ?", [uid], callback);
};

module.exports.updateBalanceByUid = function (uid, payment, callback) {
    pool.query("update account set balance = balance + ? where id = ?", [payment, uid], callback);
};

module.exports.insertOrUpdateAdminDaily = function (platformId, totalComm, taskCount, dateDay, userComm, callback) {
    pool.query("insert into stats_admin_daily(platform_id,total_commission,task_count,date_day,user_commission)" +
            " values (?,?,?,?,?) on duplicate key update total_commission=total_commission + ?, task_count= task_count + ?, " +
            "user_commission = user_commission + ?",
        [platformId, totalComm, taskCount, dateDay, userComm, totalComm, taskCount, userComm], callback
    );
};

module.exports.insertOrUpdateUserDaily = function (userId, totalComm, taskCount, inviteCount, dateDay, userComm, inviteComm, callback) {
    pool.query("insert into stats_user_daily(user_id,total_commission,task_count,invite_count,date_day,user_commission,invite_commission)" +
            " values (?,?,?,?,?,?,?) on duplicate key update total_commission=total_commission + ?, task_count= task_count + ?, " +
            " invite_count = invite_count + ?, user_commission = user_commission + ?, invite_commission = invite_commission + ?",
        [userId, totalComm, taskCount, inviteCount, dateDay, userComm, inviteComm, totalComm, taskCount, inviteCount, userComm, inviteComm],
        callback
    );
}

module.exports.insertOrUpdateUserTotal = function (userId, totalComm, updateTime, balance, taskCount, inviteCount, callback) {
    pool.query("insert into stats_user_total(user_id,total_commission,update_time,balance,task_count,invite_count)" +
            " values (?,?,?,?,?,?) on duplicate key update total_commission=total_commission + ?, update_time=?,balance=balance+?," +
            "task_count= task_count + ?, invite_count = invite_count + ?",
        [userId, totalComm, updateTime, balance, taskCount, inviteCount, totalComm, updateTime, balance, taskCount, inviteCount],
        callback
    );
};

module.exports.insertOrUpdateUserBilling = function (userId, description, debit, credit, balance, createdAt, callback) {
    pool.query("insert into user_billing(user_id,description,debit,credit,balance,created_at)" +
            " values (?,?,?,?,?,?)",
        [userId, description, debit, credit, balance, createdAt],
        callback
    );
}

module.exports.insertOrUpdatePlatformBilling = function (platformId, description, debit, credit, balance, createdAt, callback) {
    pool.query("insert into platform_billing(platform_id,description,debit,credit,balance,created_at)" +
            " values (?,?,?,?,?,?)",
        [platformId, description, debit, credit, balance, createdAt],
        callback
    );
}

module.exports.updateLastMonthFriendsComm = function (uid, lastComm, callback) {
    pool.query('update account set LAST_MONTH_FRIENDS_COMMISSION = ? where ID = ?', [lastComm, uid], callback);
};

/**
 * 注册用户
 * @param userId
 * @param iHash
 * @param callback
 */
module.exports.regUser = function (userId, iHash, callback) {
    pool.query('insert into account(invite_user_id, i_hash, created_at, task_count, invite_count, balance) ' +
            ' values(?,?,?,?,?,?)'
        , [userId ? userId : 0, iHash, new Date(), 0, userId ? 1 : 0, 0], callback);
}

/**
 * 获取账目
 * @param userId
 * @param index
 * @param count
 * @param callback
 */
module.exports.getBillingList = function (userId, index, count, callback) {
    pool.query("select ID id, USER_ID useId, DESCRIPTION description,  DEBIT debit," +
            " CREDIT credit, CREATED_AT dateDay from user_billing where user_id = ? limit ?,?",
        [userId, parseInt(index, 0), parseInt(count, 10)], callback);
};

/**
 * 插入支付请求
 * @param userId
 * @param payment
 * @param paymentType
 * @param callback
 */
module.exports.askPayment = function (userId, account, payment, paymentType, callback) {
    pool.query("insert into user_settlement(USER_ID,ACCOUNT_ID, PAYMENT,DATE_DAY,PAYMENT_TYPE,STATE)values(?,?,?,?,?,?)",
        [userId, account, payment, new Date(), paymentType, 0], callback
    );
};

module.exports.saveFinishTask = function (userId, platformId, taskId, amount, taskName, callback) {
    pool.query("insert into task(name, user_id, created_at, platform_id, unit, state) values(?,?,?,?,?,?)",
        [taskName, userId, new Date(), platformId, amount, 1], callback);
};

module.exports.getUserIdByHash = function (hash, callback) {
    pool.query("select id as id from account where i_hash=?", [hash], callback);
};


