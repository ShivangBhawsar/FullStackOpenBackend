require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const app = express()

const cors = require('cors')
app.use(cors())

app.use(express.static('dist'))

const Person = require('./models/phonebook')

const currentDate = new Date()

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
      response.send(`<p>Phonebook has info for ${count} people</p> <p>${currentDate.toDateString()} ${currentDate.toTimeString()}</p>`)
    })
    .catch(() => {
      response.status(500).json({ error: 'Internal Server Error' })
    })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)

      response.status(400).send({ error: 'malformatted id' })
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  console.log(body)
  if ((body.name === null) || (body.number === null)) {
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
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }


  next(error)
}

app.use(unknownEndpoint)
// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})