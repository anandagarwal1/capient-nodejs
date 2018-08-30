var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10,
    permission = require('././enums').Permission;

var UserSchema = new mongoose.Schema({
    // email: { type: String, unique: true, required: true, index: { unique: true } },
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    namespace: { type: String},
    organization: { type: String, required: true },
    isPresenter: { type: Boolean },
    isAdministrator: { type: Boolean , default: false},
    alias: { type: String, required: true },
    prefs: { type: Object, required: true },
    isAuthorized: { type: Boolean, default: true },
    permission: {type: permission},
    createdAt: {type: Date, default: Date.now},
    editedAt: {type: Date},
});

//authenticate input against database
UserSchema.statics.authenticate = function (username, password, callback) {
    User.findOne({ username: username })
        .exec(function (err, user) {
            if (err) {
                return callback(err)
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            console.log('password entered', password);
            console.log('password from db', user.password);
            // bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            //     if (err) return next(err);
        
            //     // hash the password using our new salt
            //     bcrypt.hash(user.password, salt, function (err, hash) {
            //         if (err) return next(err);
        
            //         // override the cleartext password with the hashed one
            //         user.password = hash;
            //         bcrypt.compare(password, user.password, function (err, result) {
            //             console.log('match or', result);
            //             if (result === true) {
            //                 return callback(null, user);
            //             } else {
            //                 return callback();
            //             }
            //         });
            //     });
            // });

           
            return callback(null, user);
        });
}

UserSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });


});

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// module.exports = mongoose.model('User', UserSchema);
var User = mongoose.model('User', UserSchema);
module.exports = User;