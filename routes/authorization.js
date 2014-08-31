var db = require('../db/mysql');
exports.authorize = function (req, res, next) {
    var token = req.get("mk_token");
    if (!token) {
        res.json(400, {result: false, msg: "无效的请求"});
    } else {
        var tokenParams = decodeURIComponent(token).split("|");
        if (tokenParams.length == 2) {
            db.getAccountInfo(tokenParams[0], function (err, row, user) {
                if (!user || user.iHash != tokenParams[1]) {
                    res.json(400, {result: false, msg: "无效的请求"});
                } else {
                    next();
                }
            });
        }
    }
}