const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Schema({ 
    username: { type: String, required: true },
    email: { type: String, required: true},
    parent_user : { type: Boolean, default: false},
    child_user: [{type: Boolean, default: false}], 
    password: { type: String, required: true }, 
    refferal_code: { type: String}, 
    referral_bonus: {type: Number, default: 0}
})

const User = mongoose.model('User', UserSchema)

module.exports = User