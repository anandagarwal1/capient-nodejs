var mongoose = require('mongoose');

var CategorySchema = new mongoose.Schema({

    id: String,
    value: String,
    label: String
});

Category = mongoose.model('Category', CategorySchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = Category;