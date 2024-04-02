module.exports = (TryCatchFunction) => (req, res, next) => {
    Promise.resolve(TryCatchFunction(req, res, next)).catch(next);
};