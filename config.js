exports.port = process.env.PORT || 3000;
exports.mongodb = {
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://admin:iaminstaKing#2015@ds039960.mongolab.com:39960/elroy-drywall-test'
};
exports.companyName = 'EA, Corp.';
exports.projectName = 'IG Follow';
exports.systemEmail = 'ig.follow.ea@gmail.com';
exports.cryptoKey = 'k3yb0ardc4t';