import { Schema as _Schema, model } from "mongoose";
import jsonwebtoken from 'jsonwebtoken';
const { sign } = jsonwebtoken;
import bcrypt from 'bcrypt';
const schema = _Schema;

const UserSchema = schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    superadmin: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    pcc: { type: Boolean, default: false },
    user_role: { type: String, enum: ['admin', 'student', 'company'], required: true },
    lastLogin: { type: Date },
    authToken: { type: String, default: "" },
    refreshToken: { type: String, default: "" },
    avatar: { type: String, default: "" }
}, { timestamp: true });

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(20);
        this.password = bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.comparePasswords = async function (userPassword) {
    return bcrypt.compare(userPassword, this.password);
}

UserSchema.methods.generateAccessToken = function () {
    return sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

const User = model("User", UserSchema);
export default User;