var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => res.render('index', { title: 'Let Me Make You Laugh', username: req.session.username }) );

module.exports = router;
