const mongoose = require("mongoose");
const validator = require("validator");

const bcrypt = require("bcryptjs");

const crypto = require("crypto");

const JWT = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter your name"],
        maxLength: [30, "Name cannot Exceed the 30 character"],
        minLength: [4, "Name Should have more then 4 character"],
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"],
    },
    password: {
        type: String,
        required: [true, "Please ENter Your Password"],
        minLength: [8, "Password Should have more then 8 character"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    role: {
        type: String,
        default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

UserSchema.pre("save", async function(next) {
    // this if condition check wether the password is modified or saved (if not modified then it return the next function)
    if (!this.isModified("password")) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
});

// create a method to get the JWT token
UserSchema.methods.getJWTtoken = function() {
    return JWT.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// reset password function

UserSchema.methods.getResetPasswordToken = function() {
    // generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // hashing and adding resetpassword token to user schema
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // token expire time
    this.resetPasswordExpire = Date.now() + 15 * 60 * 100;

    return resetToken;
};

module.exports = mongoose.model("user", UserSchema);