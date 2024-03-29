
# Imports       ======================================================================

# Uncomment bellow to switch to SSL connexion
# fs              = require("fs") 
http            = require("http")
# Uncomment bellow to switch to SSL connexion
# https           = require("https")
express         = require("express")
socket          = require("socket.io")

appKeys         = require("./config/auth")

# We define the key of the cookie containing the Express SID
EXPRESS_SID_KEY = appKeys.express_sid_key
COOKIE_SECRET   = appKeys.cookie_secret
cookieParser    = express.cookieParser(COOKIE_SECRET)

# Uncomment bellow to switch to SSL connexion
# confOptions = 
#   key: fs.readFileSync('privatekey.pem')
#   cert: fs.readFileSync('ryans-cert.pem')

# Create a new store in memory for the Express sessions
sessionStore    = new express.session.MemoryStore()
app             = express()
# Uncomment bellow to switch to SSL connexion
# server          = https.createServer(confOptions,app)
server          = http.createServer(app)
io              = socket.listen(server)
io.set "log level", 1
redis           = require("redis")
port            = process.env.PORT or 8080
mongoose        = require("mongoose")
ent             = require('ent')

passport        = require("passport")
path            = require("path")
grvtr           = require("grvtr")
async           = require("async")
moment          = require("moment")
moment          = require('moment-timezone')
mandrill        = require('mandrill-api/mandrill')
nodemailer      = require("nodemailer")
flash           = require("connect-flash")
scheduler       = require("node-schedule")
CronJob         = require('cron').CronJob
genUID          = require("shortid")
_               = require("underscore")
configDB        = require("./config/database")

# Databases  ==================================================================
db_chat         = require("./app/models/chat")
# configuration ===============================================================
moment.utc().format()

genUID.seed 664
mandrill_client = new mandrill.Mandrill(appKeys.mandrill_key);
mongoose.connect configDB.url # connect to our database

# Grid.mongo  = mongoose.mongo
# Grid configDB.url

# generate a seed to build our UID (idCools)
mailer          = require("./config/mailer")(mandrill_client, nodemailer, appKeys, moment)

# functions Import
google          = require("./config/google")
social          = require("./config/social")
sio             = require("./app/functions/sio")(io, db_chat, ent, moment)
notifs          = require("./app/functions/notifications")(_, appKeys, social, mailer)

badge          = require("./app/functions/badge")(async, _, mailer, notifs, sio)
xp              = require("./app/functions/xp")(_, mailer, notifs, sio)

relations       = require("./config/relations")(_, mailer)
games           = require("./config/game")(ent, moment)
users           = require("./config/users")(_, mailer, appKeys, genUID, social, relations, notifs, moment)
challenge       = require("./config/challenge")(_, mailer, social, moment, genUID, users)
ladder          = require("./config/ladder")(async, scheduler, mailer, _,  sio, ladder, moment, social, appKeys, xp, notifs)

# Api
eApi      = require('./config/api') app,appKeys, mailer, _, grvtr, sio, passport, genUID, xp, notifs, moment, challenge, users, relations, games, social, ladder, google 

require("./config/passport") passport,challenge, social, appKeys, _, mailer, genUID, xp, notifs, google # pass passport for configuration

app.configure ->
  
  # set up our express application
  app.use express.bodyParser() # get information from html forms
  app.use cookieParser # read cookies (needed for auth)
  app.set "view engine", "ejs" # set up ejs for templating
  app.use express.session(
    secret: "jekingIsnotHereDamnIt"
    store: sessionStore
    cookie:
      httpOnly: true
    key: EXPRESS_SID_KEY
  )
  
  # app.use(express.session({ secret: EXPRESS_SID_KEY })); // session secret
  app.use passport.initialize()
  app.use passport.session() # persistent login sessions
  app.use express.compress()
  app.use express.static(path.join(__dirname, "public"),
    maxAge: 2592000000
  )
  app.use express.logger("dev") # log every request to the console
  app.use flash() # use connect-flash for flash messages stored in session
  app.use (req, res, next)->

      # Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*');

      # Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

      # Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,X-cyf-AuthToken,content-type');

      # Set to true if you need the website to include cookies in the requests sent
      # to the API (e.g. in case you use sessions)
      res.setHeader('Access-Control-Allow-Credentials', true);

      # Pass to next layer of middleware
      next();

# routes ======================================================================
require("./app/routes") app, appKeys, eApi, db_chat, mailer, _, grvtr, sio, passport, genUID, badge, xp, notifs, moment, challenge, users, relations, games, social, ladder, google 

# Schedules, for the rankings
require("./app/schedule") CronJob,scheduler, mailer, _,  sio, ladder, moment, social, appKeys, xp, notifs

# launch ======================================================================
server.listen port
ping = ->
  sio.alive()
  return setTimeout ping, 50000
ping()

# sockets awesomization
require("./app/io") io, db_chat,  _, mailer, cookieParser, sessionStore, EXPRESS_SID_KEY, COOKIE_SECRET, sio
console.log '==========================================================='
console.log "I challenge you to watch on port " + port
console.log 'Current Application time : '+moment().utc().format()
console.log '==========================================================='
# mailer.cLog '[Cyf-Start] Current Application time : '+moment().utc().format(),