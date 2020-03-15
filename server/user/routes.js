var express = require('express');
var router = express.Router();
const userRoute = require('./routes/userRoutes')
const eventRoutes = require('./routes/eventRoutes')
router.use('/',userRoute)
router.use('/event',eventRoutes)
module.exports = router;