const { json } = require("express");

class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: "i",
            },
        } : {};

        this.query = this.query.find({...keyword });
        return this;
    }

    filters() {
        const queryCopy = {...this.queryStr };

        // remove params from query copy
        const removeFields = ["keyword", "page", "limit"];

        removeFields.forEach((key) => delete queryCopy[key]);

        // filter for price rating
        let queryStr = JSON.stringify(queryCopy);
        queryStr = JSON.parse(
            queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`)
        );
        this.query = this.query.find(queryStr);

        return this;
    }

    pagination(resultPerPage) {
        const CurrentPage = Number(this.queryStr.page) || 1;

        const skip = resultPerPage * (CurrentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skip);

        return this;
    }
}

module.exports = ApiFeatures;