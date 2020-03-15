const constants = require('../constant')
class Handlers{

    //handling all mongoose errors because it is frequently used with all models thats why it is common
      mongoErrorHandler(err){
        if(err){
              if(err.name==="ValidationError"){
                 let errMessages =[]
                for (let field in err.errors) {
                errMessages.push(err.errors[field].message)
            }
                 return errMessages[0] // send all error messages by removing [0]
             }
            else if (err.name === 'MongoError' && err.code === 11000) {
                let mongoError="";
                if(err.errmsg.search("email_1")!==-1){
                    mongoError="Email is already associated with another account.";
                   }
                if(err.errmsg.search("username_1")!==-1){
                    mongoError=constants.USEREXIST;
                   }
                if(err.errmsg.search("phone_1")!==-1){
                 mongoError= constants.PHONEEXIST;
                }
                if(err.errmsg.search("title_1")!==-1){
                    mongoError="Category is already exist.";
                   }
            return mongoError
             //err.errmsbcryptjsg.split(":")[2].split(" ")
            }
             else{

             }
        }

    }

    }

    module.exports = new Handlers();