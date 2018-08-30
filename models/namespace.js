var mongoose = require('mongoose');

var NamespaceSchema = new mongoose.Schema({
    id: String
});

Namespace = mongoose.model('Namespace', NamespaceSchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = Namespace;