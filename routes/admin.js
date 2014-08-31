///**
// * Created by kun
// */
//var express = require('express');
//var auth = require("./authorization.js");
//var router = express.Router();
//
//router.post('/admin/doLogin', function (req, res) {
//    req.assert("username", "用户名不能为空").notEmpty();
//    req.assert("password", "密码不能为空").notEmpty();
//    var errors = req.validationErrors();
//    if (errors && errors.length > 0) {
//        var ermsg = [];
//        for (var i = 0; i < errors.length; i++) {
//            ermsg.push(errors[i].msg);
//        }
//        var json = {title: '管理后台-- 请先登录', error: ermsg.join("\n")};
//        res.render('admin/login', json);
//        return;
//    }
//    if ((username === "john.guo" || username === "chris.xue") && (password === "mkIsM)n#y")) {
//        //随机生成一个授权token。
//        var _token = new Date().toDateString();
//        req.session.user_token = _token;
//        res.render("admin/dashboard", {result: true, token: _token});
//    } else {
//        res.render("admin/login", {result: false});
//    }
//});
//
//router.get('/admin/logout', function (req, res) {
//    req.session.user_token = null;
//    res.render("admin/login");
//});
//
//router.get('/admin/:action', auth, function (req, res) {
//    if (router[req.params.action]) {
//        router[req.params.action](req, res, next);
//    }
//    else {
//        res.status(404);
//        res.end();
//    }
//}
//
//router.dashboard = function (req, res, next) {
//    //TODO
//}
//
//
//module.exports = router;