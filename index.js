require('dotenv').config();
const cors = require('cors');
const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();


const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


// const uri = "mongodb://localhost:27017" 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dqhfr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // all collection
        const productCollection = client.db("shopDb").collection("products");
        const userCollection = client.db("shopDb").collection("users");

        // products related apis
        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const result = await productCollection.find()
                .skip(page * size)
                .limit(size)
                .toArray();
            res.send(result);
        })

        // get products count
        app.get('/productsCount', async (req, res) => {
            const count = await productCollection.estimatedDocumentCount();
            res.send({ count });
        })

        // users related apis
        app.post('/users', async (req, res) => {
            const userInfo = req.body;
            const query = { email: userInfo.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await userCollection.insertOne({
                ...userInfo,
                role: "customer",
                timestamp: Date.now(),
            });
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Ecommerce website is running.')
})

app.listen(port, () => {
    console.log(`UOS is running on port: ${port}`);
})