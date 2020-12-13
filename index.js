require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const Person = require("./models/person");
const { response } = require("express");
app.use(express.json());
app.use(cors());
app.use(express.static("build"));
morgan.token("body", (request, response) => {
  if (request.method === "POST") return JSON.stringify(request.body);
});

app.use(morgan(":method :url :status - :response-time ms :body"));

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  const date = new Date();
  response.send(
    `Phonebook has info for ${persons.length} people<br><br>${date}`
  );
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((personAtId) => {
      if (personAtId) {
        response.json(personAtId);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((deletedObject) => response.status(204).end())
    .catch((error) => next(error));
});

app.post("/api/persons/", (request, response, next) => {
  const person = request.body;
  const newPerson = new Person({
    name: person.name,
    number: person.number,
  });
  newPerson
    .save()
    .then((savedPerson) => response.json(savedPerson))
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const changedPerson = request.body;
  Person.findByIdAndUpdate(request.params.id, changedPerson, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      console.log("here i am");
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send(error.message);
  }

  next(error);
};

app.use(errorHandler);
