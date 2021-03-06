const router = require("express").Router();
const bcrypt = require("../../common/bcryp");
const multer = require("multer");
const eventController = require("../controller/eventController");
const constant = require("../../constant");
let path = require("path");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/event/"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});
var upload = multer({ storage: storage }).single("cover");
router.post("/create", upload, (req, res) => {
  eventController.createEvent(req.body, req.file).then(
    result => {
      res.json({ success: 1, result });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
//get event
router.post("/", (req, res) => {
  eventController.getEvent(req.body).then(
    results => {
      res.json({ success: 1, results });
    },
    err => res.json({ success: 0, message: err })
  );
});

router.post("/all", (req, res) => {
  eventController.getEvents(req.body).then(
    results => {
      results.success = 1
      res.json(results);
    },
    err => res.json({ success: 0, message: err })
  );
});
module.exports = router;
