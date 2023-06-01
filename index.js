const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("task management server is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oxnofiz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    // Send a ping to confirm a successful connection

    const taskCollection = client.db("taskDB").collection("tasks");

    // step 01
    app.post("/task", async (req, res) => {
      const newTask = req.body;
      const result = await taskCollection.insertOne(newTask);
      res.send(result);
    });

    // step 02
    app.get("/task", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const alltask = await taskCollection.find(query).toArray();
      res.send(alltask);
    });

    // step 03
    app.delete("/task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    // step 04
    app.get("/task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const results = await taskCollection.findOne(query);
      res.send(results);
    });

    // step 05
    app.put("/updatetask/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const data = req.body;
      const option = { upsert: true };
      const updatetask = {
        $set: {
          ...data,
        },
      };
      const result = await taskCollection.updateOne(query, updatetask, option);
      console.log(result);
      res.send(result);
    });

    app.patch("/taskstatus/:id", async (req, res) => {
      const id = req.params.id;
      const statusUpdate = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: statusUpdate.status,
        },
      };
      const result = await taskCollection.updateOne(query, updateDoc);
      console.log(result);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
