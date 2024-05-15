// Features such as Search , Filter etc

class ApiFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  search() {
    const keyword = this.queryString.keyword
      ? {
          name: {
            $regex: this.queryString.keyword,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    let queryCopy = { ...this.queryString };

    const removeFields = ["keyword", "page", "limit"];

    removeFields.forEach((key) => delete queryCopy[key]);
    let sort;
    if (queryCopy.category && queryCopy.category.includes("-")) {
      sort = `{"${queryCopy.category.split("-")[1]}" : "${
        queryCopy.category.split("-")[2]
      }"}`;
      sort = JSON.parse(sort);
      if (queryCopy.category.split("")[0] === "-") {
        delete queryCopy.category;
      } else {
        queryCopy.category = queryCopy.category.split("-")[0];
      }
    }
    queryCopy = JSON.stringify(queryCopy);
    queryCopy = queryCopy.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
    queryCopy = JSON.parse(queryCopy);
    this.query = this.query.find(queryCopy);
    if (sort) {
      this.query = this.query.sort(sort);
    }
    return this;
  }

  pagination(productPerPage) {
    let currentPage = Number(this.queryString.page) || 1;
    const skip = productPerPage * (currentPage - 1);
    this.query = this.query.limit(productPerPage).skip(skip);
    return this;
  }
}

module.exports = ApiFeature;
