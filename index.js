const { response, request } = require("express");
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());
app.use(express.static("build"));
morgan.token("body", (request, response) => {
    if (request.method === "POST") return JSON.stringify(request.body);
});

app.use(morgan(":method :url :status - :response-time ms :body"));

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456",
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-532355",
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-2355435",
    },
    {
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6432122",
    },
];

app.get("/api/persons", (request, response) => {
    response.json(persons);
});

app.get("/info", (request, response) => {
    const date = new Date();
    response.send(
        `Phonebook has info for ${persons.length} people<br><br>${date}`
    );
});

app.get("/api/persons/:id", (request, response) => {
    const personId = Number(request.params.id);
    const personAtId = persons.find((person) => person.id === personId);
    if (personAtId === undefined) {
        return response.status(404).send("Person with the id doesnt exist");
    }
    response.json(personAtId);
});

app.delete("/api/persons/:id", (request, response) => {
    const personId = Number(request.params.id);
    persons = persons.filter((person) => person.id !== personId);
    console.log(persons);
    response.status(204).end();
});

const generateRandomId = () => {
    return Math.floor(Math.random() * 1000000);
};

const nameAlreadyExists = (personName) => {
    return persons.find((person) => person.name === personName);
};

app.post("/api/persons/", (request, response) => {
    const person = request.body;
    if (!person.name) {
        return response.status(400).json({ error: "name is missing" });
    } else if (!person.number) {
        return response.status(400).json({ error: "number is missing" });
    } else if (nameAlreadyExists(person.name)) {
        return response.status(400).json({ error: "name already exists" });
    }
    const newPerson = {
        id: generateRandomId(),
        name: person.name,
        number: person.number,
    };
    persons = persons.concat(newPerson);
    response.json(newPerson);
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
