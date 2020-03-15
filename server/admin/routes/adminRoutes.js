const router = require("express").Router();
const bcrypt = require("../../common/bcryp");
const multer = require("multer");
const constent = require("../../constant");

const adminController = require("../controller/adminController");
let path = require("path");

//uploading configuration for admin profile pic
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/admin/"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});
var upload = multer({ storage: storage }).single("file");
router.post("/register", upload, (req, res) => {
  adminController.register(req.body, req.file).then(
    result => {
      res.json({
        success: 1,
        message: "Registered successfully",

      });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.post("/registerphone", upload, (req, res) => {
  console.log(req.file, "file");
  adminController.registerWithPhone(req.body, req.file).then(
    result => {
      res.json({
        success: 1,
        message: "Registered successfully",
        user: result
      });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.get("/dashboard", (req, res) => {
  adminController.getDashboard().then(
    result => {
      res.json(result);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.get("/getDashboardChartData", (req, res) => {
  adminController.getDashboardChartData().then(
    result => {
      res.json(result);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.get("/categories", (req, res) => {
  adminController.getCategories().then(
    result => {
      res.json({ success: 1, categories: result });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});


router.post("/login", (req, res) => {
  let body = req.body;
  adminController
    .login(body)
    .then(result => {
      res.json({ success: 1, user: result });
    })
    .catch(err => {
      res.json({ success: 0, message: err });
    });
});
router.put("/update/:id", upload, (req, res) => {
  let id = req.params.id;
  console.log("req.body", req.body);
  adminController.updateUser(id, req.body, req.file).then(
    result => {
      res.json({
        success: 1,
        message: "Your profile is updated successfully.",
        user: result
      });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.get("/404-page", (req, res) => {
  res.render("404-page", { title: "Page not found" });
});
router.get("/logout/:id", (req, res) => {
  adminController
    .userLogout(req.params.id)
    .then(result => {
      res.json({ success: 1, message: "Log out successfully" });
    })
    .catch(err => {
      res.json({ success: 0, message: err });
    });
});
router.get("/search", (req, res) => {
  console.log("req.query", req.query);
  adminController.search(req.query).then(
    result => {
      res.json({ success: 1, results: result });
    },
    err => {
      res.json({ success: 0 });
    }
  );
});
router.post("/categories/add", (req, res) => {
  adminController.addCategory(req.body).then(
    result => {
      res.json({ success: 1, message: "Category added successfully", category: result });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.post("/user", (req, res) => {
  console.log("req.body", req.body);
  adminController.getUser(req.body).then(
    result => {
      if (!result) result = {};
      res.json({ success: 1, user: result });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});

storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, path.join(__dirname, "../../uploads/posts/"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});
upload = multer({ storage, limits: { fieldSize: 75 * 1024 * 1024 } }).single(
  "file"
);
//  router.get('/getPost',(req,res)=>{
//   adminController.getPosts()
//  })
router.post("/createpost", upload, (req, res) => {
  console.log("req.body", req.body);
  adminController.createPost(req.body, req.file).then(
    result => {
      res.json({ success: 1, post: result });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});

router.post("/posts", (req, res) => {
  console.log("req.body", req.body);
  adminController.getPosts(req.body).then(
    result => {
      result.success = 1;
      res.json(result);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.post("/post", (req, res) => {
  adminController.getSinglePost(req.body).then(
    result => {
      res.json({ success: 1, post: result });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
// apis for users
router.post("/users", (req, res) => {
  adminController.getUsers(req.body).then(
    result => {
      res.json(result);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/users/"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});
var upload = multer({ storage: storage }).single("file");
router.post("/users/add", upload, (req, res) => {
  console.log(req.file, "file")

  adminController.registerWithPhone(req.body, req.file).then(
    result => {
      res.json({
        success: 1,
        message: "Registered successfully",
        user: result
      });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.put("/user/update/:id", upload, (req, res) => {
  let id = req.params.id;
  console.log("req.body", req.body);
  adminController.updateUser(id, req.body, req.file).then(
    result => {
      res.json({
        success: 1,
        message: "user is updated successfully.",
        user: result
      });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
//delete user
router.delete('/user/:id', (req, res) => {
  adminController.deleteUser(req.params.id).then((result) => {
    res.json({ success: 1, message: "user is deleted successfully." })
  })
})
//get user
router.get("/user/:id", (req, res) => {
  adminController.getUser(req.params.id).then(
    result => {

      res.json({ success: 1, user: result });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
// end of apis for users




// apis for posts



//get all user posts
router.post("/posts", (req, res) => {
  adminController.getposts(req.body).then(
    result => {
      res.json(result);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/posts/"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});
var upload = multer({ storage: storage }).single("file");
router.post("/posts/add", upload, (req, res) => {
  console.log(req.file, "file")

  adminController.registerWithPhone(req.body, req.file).then(
    result => {
      res.json({
        success: 1,
        message: "Registered successfully",
        post: result
      });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.put("/post/update/:id", upload, (req, res) => {
  let id = req.params.id;
  console.log("req.body", req.body);
  adminController.updatepost(id, req.body, req.file).then(
    result => {
      res.json({
        success: 1,
        message: "post is updated successfully.",
        post: result
      });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
//delete post
router.delete('/post/:id', (req, res) => {
  adminController.deletepost(req.params.id).then((result) => {
    res.json({ success: 1, message: "post is deleted successfully." })
  })
})
//get post
router.get("/post/:id", (req, res) => {
  adminController.getSinglePost(req.params.id).then(
    result => {

      res.json({ success: 1, post: result });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
// end of apis for posts










//delete post
router.delete('/post/:id', (req, res) => {
  adminController.deletePost(req.params.id).then((result) => {
    res.json({ success: 1, message: "post is deleted successfully." })
  })
})
//delete category
router.delete('/category/:id', (req, res) => {
  adminController.deleteCategory(req.params.id).then((result) => {
    res.json({ success: 1, message: "category is deleted successfully." })
  })
})


//subadmin routes

//get subadmins

router.post("/subadmins", (req, res) => {
  console.log("req.body", req.body);
  adminController.getSubadmins(req.body).then(
    result => {
      result.success = 1;
      res.json(result);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.post("/subadmin/add", (req, res) => {
  adminController.registerAdmin(req.body).then(
    result => {
      res.json({
        success: 1,
        message: constent.REGISTERSUCCESS,
        user: result
      });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});

//get subadmin
router.get("/subadmin/:id", (req, res) => {
  adminController.getSingleSubadmin(req.params.id).then(
    result => {

      res.json({ success: 1, user: result });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});

router.put("/subadmin/update/:id", upload, (req, res) => {
  let id = req.params.id;
  console.log("req.body", req.body);
  adminController.updateSubadmin(id, req.body, req.file).then(
    result => {
      res.json({
        success: 1,
        message: "User is updated successfully.",
        user: result
      });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});

//delete user
router.delete('/subadmin/:id', (req, res) => {
  adminController.deleteSubadmin(req.params.id).then((result) => {
    res.json({ success: 1, message: "user is deleted successfully." })
  })
})

//end of subadmin routes

//reports apis


router.post("/reportedPosts", (req, res) => {
  console.log("req.body", req.body);
  adminController.getreportedPosts(req.body).then(
    result => {
      // result.success = 1;
      res.json(result);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});





router.post("/Comments", (req, res) => {
  adminController.getComments(req.body).then(
    result => {
      result.success = 1
      res.json(result);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});


router.put("/comment/update/:id", (req, res) => {
  console.log("req.body", req.body);
  adminController.updateComment(req.params.id, req.body).then(
    result => {
      res.json({
        success: 1,
        message: "Comment is updated successfully.",
        comment: result
      });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});

//delete user
router.delete('/comment/:id', (req, res) => {
  console.log("delete id", req.params.id, req.query);
  adminController.deleteComment(req.params.id, req.query).then((result) => {
    res.json({ success: 1, message: "comment is deleted successfully." })
  }, err => {
    res.json({ success: 0, message: err });
  }
  )
})
// router.delete('/reportedcomment',(req,res)=>{
//   console.log("delete ids",req.body);
//   adminController.deleteReportedComment(req.body).then((result)=>{
//     res.json({success:1,message:"comment is deleted successfully."})
//   })
// })


//delete event
router.delete('/event/:id', (req, res) => {
  adminController.deleteEvent(req.params.id).then((result) => {
    res.json({ success: 1, message: "Event is deleted successfully." })
  })
})


router.post("/userActivities", (req, res) => {
  adminController.getUserActivities(req.body).then(
    results => {

      res.json({ results, success: 1 });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.post("/BrandAuthRequests", (req, res) => {
  adminController.getBrandAuthRequests(req.body).then(
    results => {
      res.json(results);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
// BrandAuthRequest

router.get("/BrandAuthRequest/:id", (req, res) => {
  adminController.getBrandAuthRequest(req.params.id).then(
    result => {
      res.json(result);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});

router.post("/BrandAchievements", (req, res) => {
  adminController.getBrandAchievements(req.body).then(
    results => {
      res.json(results);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.delete('/BrandAuthRequest/:id', (req, res) => {
  adminController.deleteBrandRequest(req.params.id).then((result) => {
    res.json({ success: 1, message: "Request is deleted successfully." })
  })
})
router.delete('/BrandAchievement/:id', (req, res) => {
  adminController.deleteAchievement(req.params.id).then((result) => {
    res.json({ success: 1, message: "Achievement is deleted successfully." })
  })
})

router.put("/brandAuth/update", (req, res) => {
  console.log("bodyddddd", req.body);

  adminController.updateBrandAuth(req.body).then(
    result => {
      res.json({ success: 1, result, message: "Status is updated successfully." });
    },
    err => {
      res.json({ success: 0, err });
    }
  );
});

module.exports = router;
