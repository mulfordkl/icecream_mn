const MongoClient = require('mongodb').MongoClient
var config = require('./config');
const uri = config.mongodb_uri

class Connection {

    static async open() {
        if (this.db) return this.db
        this.db = await MongoClient.connect(this.url, this.options)
        return this.db
    }

}

Connection.db = null
Connection.url = uri
Connection.options = {
    bufferMaxEntries:   0,
    useNewUrlParser:    true,
    useUnifiedTopology: true,
}

module.exports = { Connection }