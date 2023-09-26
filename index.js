const redis = require('redis')
const axios = require('axios')
const express = require('express')

const USER_NAME = 'username'
const PORT = 3000
const REDIS_PORT = 6379

const client = redis.createClient(REDIS_PORT)
client.connect();
client.on('error', err => console.log('Redis Client Error', err));

const app = express()

app.set('view engine', 'pug')
let info;

// get repos from github api
const getRepos = async (req, res) => {
  try {
    const username = req.params[USER_NAME]
    const response = await axios.get(`https://api.github.com/users/${username}`)
    const data = response.data
    const convertedData = JSON.stringify(data)
    console.log("this value from github")
    info = "this value from github"
    client.set(username, convertedData)
    res.render('index', {data, info})
  } catch (err) {
    console.error(err)
    res.status(500).send(err.message)
  }
}

//cache middleware
const cache = async (req, res, next) => {
  const {username} = req.params;

  const value = await client.get(username);
  if(value){
    console.log("this value from redis")
    info = "this value from redis"
    const data = JSON.parse(value)
    res.render('index', { data, info })
  } else {
    next()
  }
}

app.get(`/repos/:${USER_NAME}`, cache, getRepos)

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
