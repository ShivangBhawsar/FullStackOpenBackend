const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
    `mongodb+srv://fullstack:${password}@fso.zj7xvsc.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const PhonebookEntry = mongoose.model('Phonebook', phonebookSchema)

if (process.argv.length === 5) {

  const entry = new PhonebookEntry({
    name: process.argv[3],
    number: process.argv[4]
  })

  entry.save().then(() => {
    console.log(`added ${entry.name} number ${entry.number} to phonebook`)
    mongoose.connection.close()
  })
}
else {
  PhonebookEntry.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(entry => {
      console.log(`${entry.name} ${entry.number}`)
    })
    mongoose.connection.close()
  })
}