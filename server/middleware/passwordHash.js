const crypto = require('crypto');

module.exports = function passwordHash(password){
    return crypto.createHash('sha256').update(password).digest('hex')
}