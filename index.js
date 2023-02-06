const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

const userName = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

// middleware

app.use(express.json());
app.use(cors());

// mongodb connect

const uri = `mongodb+srv://${userName}:${password}@cluster1.evach3k.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// All crud operation

async function run() {
  try {
    const noteCollection = client.db("notebook").collection("notelist");

    // post a note
    app.post("/notes", async (req, res) => {
      const title = req.body.title;
      const tagline = req.body.tagline;
      const description = req.body.description;
      const pinned = req.body.pinned;

      const noteInfo = {
        title: title,
        tagline: tagline,
        description: description,
        pinned: pinned,
        date: Date.now(),
      };

      const result = await noteCollection.insertOne(noteInfo);

      res.status(200).send(result);
    });

    // get a note
    app.get("/notes", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const query = {};
      const result = await noteCollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .sort({ date: -1, pinned: -1 })
        .toArray();
      const count = await noteCollection.estimatedDocumentCount();
      res.status(200).send({ result, count });
    });

    // delete a note

    app.delete("/notes/:id", async (req, res) => {
      const id = req.params.id;
      // const filter = { _id: ObjectId(id) };
      const result = await noteCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // pinn a note
    app.patch("/notes/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          date: Date.now(),
          pinned: 1,
        },
      };
      const result = await noteCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // update a note
    app.put("/notes/:id", async (req, res) => {
      const id = req.params.id;
      const title = req.body.title;
      const tagline = req.body.tagline;
      const description = req.body.description;

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          title: title,
          tagline: tagline,
          description: description,
          date: Date.now(),
          pinned: 0,
        },
      };
      const result = await noteCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.log(err.name, err.message));

// test api

app.get("/", async (req, res) => {
  res.send("wellcome to note book server");
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
