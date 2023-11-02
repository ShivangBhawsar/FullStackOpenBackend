require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const app = express()

const cors = require('cors')
app.use(cors())

app.use(express.static('dist'))

const Person = require('./models/phonebook')

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

const currentDate = new Date();

const customFormat = (tokens, req, res) => {
    if (tokens.method(req, res) === 'POST') {
        // console.log(res);
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms',
            JSON.stringify(res.body)
        ].join(' ')
    }
}
app.use(morgan(customFormat))
app.use(express.json())

app.get('/api/persons', (request, response) => {
    Person.find({}).then(person => {
        response.json(person)
    })
})

app.get('/info', (request, response) => {
    Person.countDocuments({})
        .then(count => {
            response.send(`<p>Phonebook has info for ${count} people</p> <p>${currentDate.toDateString()} ${currentDate.toTimeString()}</p>`);
        })
        .catch(error => {
            response.status(500).json({ error: 'Internal Server Error' });
        });
});

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    console.log(body)
    if ((body.name == null) || (body.number == null)) {
        return response.status(400).json({
            error: 'Either name or number of both are missing!'
        })
    }
    //To be implemented later
    // if (persons.filter(person => person.name === body.name).length > 0) {
    //     return response.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})