const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://klm_admin:YG4CzIa5fwfIu11V@cluster0.mfuvt.mongodb.net/icecream_shops?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var bcrypt = require("bcrypt");

const saltRounds = 10;
const myPlaintextPassword = 'LilyLiloNova412'; // replace with password chosen by you OR retain the same value
const passwordHash = bcrypt.hashSync(myPlaintextPassword, saltRounds);


async function add_new_shop() {
    try {
        await client.connect();
        const collection = client.db("icecream_mn").collection("users");

        const result = await collection.insertOne({ "username": "Madelyn", 
                                                    "password": passwordHash,
                                                });
        console.log(result);
    } catch (e) {
        console.log(e);
    }

};

add_new_shop().catch(console.log);