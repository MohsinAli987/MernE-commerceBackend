const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter Product name"],
    },
    description: {
        type: String,
        required: [true, "Please enter Product Description"],
    },
    price: {
        type: Number,
        required: [true, "Please enter Product Price"],
        maxLength: [8, "Please cannot exceed 8 character"],
    },
    ratings: {
        type: Number,
        default: 0,
    },
    images: [{
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    }, ],
    category: {
        type: String,
        required: [true, "Please Enter Product Category"],
    },
    Stock: {
        type: Number,
        required: [true, "Please Enter product Stock"],
        maxLength: [4, "Stock cannot exceed 4 characters"],
        default: 1,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "user",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
        },
        comment: {
            type: String,
            required: true,
        },
    }, ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model("products", ProductSchema);