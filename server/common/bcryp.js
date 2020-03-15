
const bcrypt = require('bcryptjs')
hashPassword= function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}
compareHash= function(password,hash){
    return bcrypt.compareSync(password, hash);
}
module.exports = {
    hashPassword,
    compareHash
}