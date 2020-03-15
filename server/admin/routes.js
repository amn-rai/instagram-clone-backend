var express = require('express');
var router = express.Router();
const adminRoute = require('./routes/adminRoutes')
const eventRoutes = require('./routes/eventRoutes')
router.use('/',adminRoute)
router.use('/event',eventRoutes)
module.exports = router;