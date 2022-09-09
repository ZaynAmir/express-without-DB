const config = require('config')
const logger = require('./logger')
const helmet = require('helmet')
const morgan = require('morgan')
const Joi = require('joi')
const express = require('express')
const app = express()


// configrations
console.log(`active env name : ${config.get('name')}`)
console.log(`database host : ${config.get('databaseConfig.host')}`)
console.log(`database password : ${config.get('databaseConfig.password')}`)

// envs
// console.log(`NODE_ENV : ${process.env.NODE_ENV}`)
// console.log(`APP_ENV : ${app.get('env')}`)


// middleware build in
app.use(express.json())
app.use(express.urlencoded({extended: true})) //to parse the key value from the payload
app.use(express.static('public')) // to serve static file in public folder 

// third party middlewares
app.use(helmet());

if (app.get('env') === 'development'){
    app.use(morgan('tiny')) //gettings logs in terminal
    console.log("Morgan Logs enabled ...")
}


// custom middlewares
app.use(logger);

app.use(function (req, res, next){
    console.log("authenticating...")
    next()
});



const courses = [
    {id: 1, name: "course1"},
    {id: 2, name: "course2"},
    {id: 3, name: "course3"},
]



app.get("/", (req, res) => {
    res.send("Hello world")
})

app.get("/api/courses", (req, res) => {
    res.send(courses)
})

app.get("/api/courses/:id", (req, res) => {
    const course = courses.find(c => c.id === +req.params.id)
    if(!course) res.status(404).send(`course with given ${req.params.id} id not found`)
    res.send(course)
})

app.post("/api/courses", (req, res) => {

    // validate

    const {error} = validation(req.body)

    // error if not valid
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    const course = {
        id: courses.length + 1,
        name : req.body.name
    }
    courses.push(course)
    res.send(course)
})

app.put('/api/courses/:id', (req, res) => {
    // check for course
    const course = courses.find(c => c.id === +req.params.id)
    if(!course) return res.status(404).send(`course with given ${req.params.id} id not found`)
    // validate

    const {error} = validation(req.body)

    // error if not valid
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    //update
    course.name = req.body.name
    res.send(course)    

})

app.delete("/api/courses/:id", (req, res) => {
    // search course with given id
    const course =  courses.find(c => c.id === parseInt(req.params.id))
    if(!course){
        return res.status(404).send(`course with given ${req.params.id} id not found`)
    }
    const index = courses.indexOf(course)
    courses.splice(index, 1)
    res.send(course)
    
    
})


app.get("/posts/:year/:month", (req, res) => {
    res.send(`${req.query.id}`)
})

function validation(input){
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    })
    return schema.validate(input)
}

const port = process.env.PORT || 4000
app.listen(4000, () => console.log("server started at port " + port))

