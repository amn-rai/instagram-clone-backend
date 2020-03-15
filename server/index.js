const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const morgan = require("morgan");
const session = require("express-session");
const app = new express();
const path = require("path");
const cors = require("cors");
const flash = require("connect-flash");
const socketRoute = require('../server/Socket/socketRoute')


var http = require('http').Server(app);
var io = require('socket.io')(http);
//connecting database
require("./config");
//custom routes
const userRoute = require("./user/routes");
const adminRoute = require("./admin/routes");
// app.set('views','./views');
app.set("views", ["./views", "./views/edit/"]);
app.set("view engine", "ejs");
app.use("/", express.static("./public"));
app.use(cors())
app.use("/static", express.static(path.join(__dirname, "./uploads")));
app.use(bodyparser.urlencoded({ extended: true, limit: '60mb' }));
app.use(bodyparser.json({ limit: '60mb' }));
app.use(
  session({
    secret: "user_id",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 3600000
    }
  })
);
app.get('/', (req, res) => {
  res.send("Peng a social media app ")
})
app.use(flash());
app.use(function (req, res, next) {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});
app.use(function (req, res, next) {
  let hour = 3600000;
  req.session.cookie.expires = new Date(Date.now() + hour);
  req.session.cookie.maxAge = 100 * hour;
  next();
});
app.use(morgan("dev"));
app.use("/users", userRoute); //update /users
app.use("/", adminRoute);
let port = process.env.port || 5001;
http.listen(port, () => {
  console.log(`server is running on port ` + port);
});
socketRoute(io)
module.exports = app;
