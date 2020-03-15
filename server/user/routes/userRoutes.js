const router = require("express").Router();
const bcrypt = require("../../common/bcryp");
const multer = require("multer");
const userController = require("../controller/userController");
const constant = require("../../constant");
let path = require("path");
const ENCONSTANT = require("../../lib/language/en");
const CHCONSTANT = require("../../lib/language/sp");
let CONSTANT = {};

//register user
//uploading configuration for user profile pic
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
router.post("/register", upload, (req, res) => {
  userController.register(req.body, req.file).then(
    result => {
      res.json({
        success: 1,
        //  message: "Registered successfully",
        user: result
      });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.post("/registerphone", upload, (req, res) => {
  userController.registerWithPhone(req.body, req.file).then(
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
router.post("/checkphone", upload, (req, res) => {
  userController.checkPhone(req.body).then(
    result => {
      res.json({
        success: 1
      });
    },
    err => {
      res.json({ success: 0 });
    }
  );
});
router.post("/loginphone", (req, res) => {
  let body = req.body;
  userController
    .login(body)
    .then(result => {
      res.json({ success: 1, message: "Login successfully", user: result });
    })
    .catch(err => {
      res.json({ success: 0, message: err });
    });
});
router.get("/categories", (req, res) => {
  userController.getCategories().then(
    categories => {
      res.json({ success: 1, categories });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.put("/update/:id", upload, (req, res) => {
  let id = req.params.id;


  userController.updateUser(id, req.body, req.file).then(
    result => {
      if (req.body.lang == "en")
        CONSTANT = ENCONSTANT
      else {
        CONSTANT = CHCONSTANT
      }
      res.json({
        success: 1,
        message: CONSTANT.PASSWORDUPDATESUCCESS,
        user: result
      });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});

//change user password
router.put("/change-password/:id", (req, res) => {
  let id = req.params.id;
  let hash = {
    password: bcrypt.hashPassword(req.body.password)
  };
  userController.changePassword(id, req.body, hash).then(
    message => {
      res.json({ success: 1, message: message });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.post("/forget-password", (req, res) => {
  userController.forgetPassword(req.body).then(
    message => {
      res.json({ success: 1, message: message });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.get("/404-page", (req, res) => {
  res.send("Page not found");
});
router.get("/logout/:id", (req, res) => {
  userController
    .userLogout(req.params.id)
    .then(result => {
      res.json({ success: 1, message: "Log out successfully" });
    })
    .catch(err => {
      res.json({ success: 0, message: err });
    });
});
router.post("/categories/add", (req, res) => {
  userController.addCategory(req.body).then(
    mesg => {
      res.json({ mesg });
    },
    err => {
      res.json({ err });
    }
  );
});
router.get("/logout/:id", (req, res) => {
  userController
    .userLogout(req.params.id)
    .then(result => {
      res.json({ success: 1, message: "Log out successfully" });
    })
    .catch(err => {
      res.json({ success: 0, message: err });
    });
});

router.post("/follow", (req, res) => {
  userController.followUser(req.body).then(
    mesg => {
      mesg.success = 1;
      res.json(mesg);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});

router.get("/recommended", (req, res) => {
  userController.getRecommended().then(
    result => {
      res.json({ success: 1, users: result });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.post("/user", (req, res) => {

  userController.getUser(req.body).then(
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
      file.fieldname + "-" + file.originalname
    );
  }
});
upload2 = multer({ storage, limits: { fieldSize: 75 * 1024 * 1024 } }).fields([{ name: 'file', maxCount: 20 }, { name: 'cover', maxCount: 1 }])

router.post("/createpost", upload2, (req, res) => {
  // console.log("REQ.FILES", req.files);

  userController.createPost(req.body, req.files).then(
    result => {
      res.json({ success: 1, post: result });
    },
    err => {
      console.log(err);

      res.json({ success: 0, message: err });
    }
  );
});
router.post("/postj/update", upload2, (req, res) => {
  console.log("REQ.BODY", req.body);
  userController.updatePost(req.body, req.files).then(
    result => {
      res.json({ success: 1, post: result });
    },
    err => {
      console.log(err);

      res.json({ success: 0, message: err });
    }
  );
});
router.post("/posts", (req, res) => {
  userController.getPosts(req.body).then(
    result => {
      result.success = 1;
      res.json(result);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.post("/posts/draft", (req, res) => {
  userController.getDraftPosts(req.body).then(
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
  userController.getSinglePost(req.body).then(
    result => {
      res.json({ success: 1, post: result });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.post("/postsfollowed", (req, res) => {
  userController.getPostsFollowed(req.body).then(
    result => {
      result.success = 1;
      res.json(result);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.post("/postsNearby", (req, res) => {
  userController.getPostsNearBy(req.body).then(
    result => {
      result.success = 1;
      res.json(result);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.post("/postsBrowsing", (req, res) => {
  userController.getPostsBrowsing(req.body).then(
    result => {
      // console.log("result", result);

      result.success = 1;
      res.json(result);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});

router.post("/likePost", (req, res) => {
  userController
    .likePost(req.body)
    .then(result => {
      result.success = 1;
      res.json(result);
    })
    .catch(err => res.json({ success: 0, message: err }));
});

router.post("/commentPost", (req, res) => {
  userController
    .commentPost(req.body)
    .then(result => res.json({ success: 1, comment: result }))
    .catch(err => res.json({ success: 0, message: err }));
});

router.post("/likeComment", (req, res) => {
  userController
    .likeComment(req.body)
    .then(result => {
      result.success = 1;
      res.json(result);
    })
    .catch(err => res.json({ success: 0, message: err }));
});
router.post("/replyComment", (req, res) => {
  userController.replyComment(req.body).then(
    result => {
      res.json({ success: 1, replyComment: result });
    },
    err => res.json({ success: 0, message: err })
  );
});

router.post("/likeReply", (req, res) => {
  userController.likeReply(req.body).then(
    result => {
      result.success = 1;
      res.json(result);
    },
    err => res.json({ success: 0, message: err })
  );
});
router.post("/addPostFavourite", (req, res) => {
  userController.addPostToFavourite(req.body).then(
    result => {
      result.success = 1;
      res.json(result);
    },
    err => res.json({ success: 0, message: err })
  );
});
router.post("/saveDraft", (req, res) => {
  userController.saveDraft(req.body).then(
    result => {
      result.success = 1;
      res.json(result);
    },
    err => res.json({ success: 0, message: err })
  );
});
router.get("/favouritePosts/:user", (req, res) => {
  userController.getFavouritePosts(req.params.user).then(
    result => {
      res.json({ success: 1, posts: result });
    },
    err => res.json({ success: 0, message: err })
  );
});
router.post("/posts/liked", (req, res) => {
  userController.getLikedPosts(req.body).then(
    result => {
      res.json({ success: 1, posts: result });
    },
    err => res.json({ success: 0, message: err })
  );
});

router.put("/change-password", (req, res) => {
  let hash = {
    password: bcrypt.hashPassword(req.body.password)
  };
  userController.changePassword(req.body, hash).then(
    message => {
      res.json({ success: 1, message: message });
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
//search  user profiles
router.post("/search", (req, res) => {
  userController.search(req.body).then(
    result => {
      result.success = 1
      res.json(result);
    },
    err => {
      res.json({ success: 0 });
    }
  );
});
//search  posts with filters
router.get("/searchPosts", (req, res) => {
  userController.searchPosts(req.body).then(
    result => {
      res.json({ success: 1, posts: result });
    },
    err => {
      res.json({ success: 0 });
    }
  );
});

//report apis
router.post("/reportPost", (req, res) => {
  userController.reportPost(req.body).then(
    result => {
      res.json({ success: 1, message: constant.REPORTSUCCESS });
    },
    err => res.json({ success: 0, message: err })
  );
});

router.post("/reportComment", (req, res) => {
  userController.reportComment(req.body).then(
    result => {
      res.json({ success: 1, message: constant.REPORTSUCCESS });
    },
    err => res.json({ success: 0, message: err })
  );
});
router.post("/reportCommentReply", (req, res) => {
  userController.reportCommentReply(req.body).then(
    result => {
      res.json({ success: 1, message: constant.REPORTSUCCESS });
    },
    err => res.json({ success: 0, message: err })
  );
});

//pricay apis
router.post("/followrequest", (req, res) => {
  userController.followRequestUser(req.body).then(
    mesg => {
      mesg.success = 1;
      res.json(mesg);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.post("/followrequests", (req, res) => {
  userController.getfollowRequest(req.body).then(
    result => {
      let data = {}
      data.success = 1
      data.results = result
      res.json(data);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});

//end of privacy apis
//blocked user apis
router.post("/blockUser", (req, res) => {
  userController.blockUser(req.body).then(
    mesg => {
      console.log("mesg", mesg);

      mesg.success = 1;
      res.json(mesg);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});
router.post("/blockedUsers", (req, res) => {
  userController.getBlockedUserList(req.body).then(
    result => {
      let data = {}
      data.success = 1
      data.results = result
      res.json(data);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});

//end of privacy apis

router.post("/tagPost", (req, res) => {
  userController.tagPostSearchUser(req.body).then(
    result => {
      let data = {}
      data.success = 1
      data.results = result
      res.json(data);
    },
    err => {
      res.json({ success: 0, message: err });
    }
  );
});

storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, path.join(__dirname, "../../uploads/branddoc/"));
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }
});
// var upload = multer({ storage: storage }).single("file");
upload1 = multer({ storage, limits: { fieldSize: 75 * 1024 * 1024 } }).fields([{ name: 'file', maxCount: 10 }])

router.post("/brandAuth/apply", upload1, (req, res) => {
  userController.applyBrandAuth(req.body, req.files).then(
    result => {
      res.json({ success: 1, result });
    },
    err => {
      res.json({ success: 0, err });
    }
  );
});

router.post("/brandAchievements/add", upload1, (req, res) => {
  userController.aaaBrandAchievements(req.body, req.files).then(
    result => {
      res.json({ success: 1, result });
    },
    err => {
      res.json({ success: 0, err });
    }
  );
});


router.delete('/post/:id', (req, res) => {
  userController.deletePost(req.params.id).then((result) => {
    res.json({ success: 1, message: "Post is deleted successfully." })
  }, () => {

    res.json({ success: 0, message: constant.FALSEMSG })

  })
})

//ADDED BY PAWAN========================================================
router.post('/getFollower', (req, res) => {
  userController.getFollower(req.body).then((result) => {
    res.json(result)
  }, (err) => {
    console.log(err);

    res.json({ success: 0, message: constant.FALSEMSG, err })

  })
})


router.get('/getChatlist/:sender_id', (req, res) => {
  userController.getChatlist(req.params.sender_id).then((result) => {
    if (result) {
      return res.json({
        success: 1, sum: result.sum, list: result.result
      })
    }
  }, (err) => {
    console.log(err);

    res.json({ success: 0, message: err })

  }).catch(error => {
    console.log(error)
    return res.json({ success: 0, message: error })
  })
})

router.get('/searchUserChatList/:sender_id', (req, res) => {
  userController.searchUserChatList(req.params.sender_id, req.query).then((result) => {
    if (result) {
      return res.json({
        success: 1, list: result
      })
    }
  }, (err) => {
    console.log(err);

    res.json({ success: 0, message: err })

  }).catch(error => {
    console.log(error)
    return res.json({ success: 0, message: error })
  })
})

router.get('/getMutual', (req, res) => {
  userController.getMutual(req.query.loggedinUser, req.query.search).then((result) => {
    if (result) {
      return res.json({
        success: 1, result: result
      })
    }
  }, (err) => {
    console.log(err);

    res.json({ success: 0, message: err })

  }).catch(error => {
    console.log(error)
    return res.json({ success: 0, message: error })
  })
})


router.post('/uploadVideo', upload, (req, res) => {
  userController.uploadVideo(req.file).then(result => {

    if (result) {
      return res.json({
        success: 1, message: result
      })
    }
  }).catch(error => {
    console.log(error)
    return res.json({ success: 0, message: error })
  })
})


router.post('/uploadMedia', upload, (req, res) => {
  userController.uploadMedia(req.file).then(result => {

    if (result) {
      return res.json({
        success: 1, message: result
      })
    }
  }).catch(error => {
    console.log(error)
    return res.json({ success: Constant.FALSE, message: error })
  })
})

router.post('/createGroup', upload, (req, res) => {
  userController.createGroup(req.body, req.file).then(result => {

    if (result) {
      return res.json({
        success: 1, result: result
      })
    }
  }).catch(error => {
    console.log(error)
    return res.json({ success: 0, message: error })
  })
})

router.get('/getGroupInfo', (req, res) => {
  userController.getGroupInfo(req.query.groupId).then(result => {

    if (result) {
      return res.json({
        success: 1, result: result
      })
    }
  }).catch(error => {
    console.log(error)
    return res.json({ success: 0, message: error })
  })
})

router.patch('/updateGroup', upload, (req, res) => {
  userController.updateGroup(req.body, req.file).then(result => {

    if (result) {
      return res.json({
        success: 1, result: result
      })
    }
  }).catch(error => {
    console.log(error)
    return res.json({ success: 0, message: error })
  })
})



router.patch('/reportUser', (req, res) => {
  userController.reportUser(req.body).then((result) => {
    if (result) {
      return res.json({
        success: 1, result: result
      })
    }
  }, (err) => {
    console.log(err);

    res.json({ success: 0, message: err })

  }).catch(error => {
    console.log(error)
    return res.json({ success: 0, message: error })
  })
})

router.patch('/leaveGroup', (req, res) => {
  userController.leaveGroup(req.body).then((result) => {
    if (result) {
      return res.json({
        success: 1, message: "Exited Successfully", result: result
      })
    }
  }, (err) => {
    console.log(err);

    res.json({ success: 0, message: err })

  }).catch(error => {
    console.log(error)
    return res.json({ success: 0, message: error })
  })
})


router.patch('/expelMember', (req, res) => {
  userController.expelMember(req.body).then((result) => {
    if (result) {
      return res.json({
        success: 1, message: "removed Successfully", result: result
      })
    }
  }, (err) => {
    console.log(err);

    res.json({ success: 0, message: err })

  }).catch(error => {
    console.log(error)
    return res.json({ success: 0, message: error })
  })
})


router.patch('/deleteGroup', (req, res) => {
  userController.deleteGroup(req.body).then((result) => {
    if (result) {
      return res.json({
        success: 1, message: "Group Deleted Successfully",
      })
    }
  }, (err) => {
    console.log(err);

    res.json({ success: 0, message: err })

  }).catch(error => {
    console.log(error)
    return res.json({ success: 0, message: error })
  })
})

router.get("/getUserNotifications", (req, res) => {
  userController.getUserNotifications(req.query.userId, req.query.skip).then(
    result => {
      result.success = 1;
      res.json(result);

    },
    err => {
      res.json({ success: 0 });
    }
  );
});


module.exports = router;
