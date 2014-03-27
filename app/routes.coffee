
isLoggedIn = (req, res, next) ->
  return next()  if req.isAuthenticated()
  res.redirect "/"
  return
  
module.exports = (app, _, sio, passport, genUID, xp, notifs, moment, challenge, users, relations, games, social, ladder, img) ->

  # show the home page (will also have our login links)
  app.get "/", (req, res) ->
    if req.isAuthenticated()
      res.render "index_logged.ejs",
        currentUser: req.user
    else
      res.render "index.ejs",
        currentUser: false

  app.get "/eval/:hash", (req, res) ->
    hash = req.params.hash
    users.validateEmail hash, (result) ->
      if result
        res.redirect "/login"
      else
        res.redirect "/"

  # LOGOUT ==============================
  app.get "/logout", isLoggedIn, (req, res) ->
    notifs.logout req.user
    sio.glob "glyphicon glyphicon-log-out", req.user.local.pseudo + " disconnected"
    users.setOffline req.user, (result) ->
      if result
        req.session.notifLog = false
        req.session.isLogged = false
        req.logout()
        res.redirect "/"

  # FRIENDS LIST SECTION ======================
  app.get "/friends", isLoggedIn, (req, res) ->
    users.getFriendList req.user._id, (fList) ->

      res.render "friendList.ejs",
        currentUser: req.user
        friends: fList

  # PROFILE SECTION ===========================
  app.get "/profile", isLoggedIn, (req, res) ->
    res.render "profile.ejs",
      currentUser: req.user

  app.get "/settings", isLoggedIn, (req, res) ->
    res.render "setting.ejs",
      currentUser: req.user

  # CHALLENGES SECTION =========================
  app.get "/request", isLoggedIn, (req, res) ->
    
    #get Ongoing challenges for the current user
    
    # @todo : merge this
    challenge.challengerRequests req.user._id, (dataChallenger) ->
      challenge.challengedRequests req.user._id, (dataChallenged) ->
        obj =
          sent: dataChallenger
          request: dataChallenged

        res.render "request.ejs",
          currentUser: (if (req.isAuthenticated()) then req.user else false)
          challenges: obj

  # =============================================================================
  # TRIBUNAL   ==================================================================
  # =============================================================================

  # USER TRIBUNAL'S CASES SECTION =========================
  app.get "/tribunal", isLoggedIn, (req, res) ->
    challenge.userWaitingCases req.user, (data) ->
      
      # console.log(data);
      res.render "tribunal.ejs",
        currentUser: req.user
        cases: data

  # CASE DETAIL SECTION =========================
  # @TODO
  app.get "/t/:id", isLoggedIn, (req, res) ->
    id = req.params.id

  # =============================================================================
  # ONGOINGS   ==================================================================
  # =============================================================================

  # ONGOING DETAILS SECTION =========================
  app.get "/o/:id", (req, res) ->
    id = req.params.id
    challenge.ongoingDetails id, (data) ->
      
      # console.log(data);
      res.render "ongoingDetails.ejs",
        currentUser: (if (req.isAuthenticated()) then req.user else false)
        user: req.user
        ongoing: data

  # USER'S ONGOINGS SECTION =========================
  app.get "/ongoing", isLoggedIn, (req, res) ->
    
    #get Ongoing challenges for the current user
    challenge.userAcceptedChallenge req.user._id, (data) ->
      cStart = undefined
      eStart = undefined
      upcomingChall = []
      ongoingChall = []
      endedChall = []
      reqValidation = []
      _.each data, (value, key) ->
        cStart = data[key].launchDate
        cEnd = data[key].deadLine
        
        # Is the challenge's deadline passed ?
        # If yes, mark it as not completed, failed        
        if moment(cEnd).isSame() or moment(cEnd).isBefore()
          console.log moment(cEnd).isSame() or moment(cEnd).isBefore()
          console.log data[i].idCool
          challenge.crossedDeadline data[i]._id
          endedChall.push data[i]
        
        # Challenge is awaiting validation
        # To determine if its belong to the current user or not will be done client-side.
        else if data[i].waitingConfirm is true and data[i].progress < 100
          reqValidation.push data[i]
          console.log "parsed reqValidation : " + data[i].waitingConfirm
        
        # Start hasn't been reached
        else if not moment(cStart).isBefore() and not moment(cEnd).isBefore() and data[i].progress < 100
          upcomingChall.push data[i]
          console.log "parsed upcoming : " + data[i]._id
        
        # Start has been reached but not end
        else if moment(cStart).isBefore() and not moment(cEnd).isBefore() and data[i].progress < 100
          ongoingChall.push data[i]
          console.log "parsed ongoing : " + data[i]._id

      res.render "ongoing.ejs",
        currentUser: req.user
        toValidate: reqValidation
        upChallenges: upcomingChall
        onChallenges: ongoingChall
        endChallenges: endedChall

  # =============================================================================
  # CHALLENGES ==================================================================
  # =============================================================================

  # CHALLENGE LIST SECTION =========================
  app.get "/challenges", (req, res) ->
    challenge.getList (list) ->
      res.render "challenges.ejs",
        currentUser: (if (req.isAuthenticated()) then req.user else false)
        challenges: list

  # CHALLENGE DETAILS SECTION =========================
  app.get "/c/:id", (req, res) ->
    cId = req.params.id
    challenge.getChallenge cId, (data) ->
      res.render "challengeDetails.ejs",
        currentUser: (if (req.isAuthenticated()) then req.user else false)
        challenge: data


  # CREATE CHALLENGE SECTION =========================
  app.get "/newChallenge", isLoggedIn, (req, res) ->
    res.render "newChallenge.ejs",
      currentUser: req.user
      challenge: false

  app.post "/newChallenge", isLoggedIn, (req, res) ->
    challenge.create req, (done) ->
      notifs.createdChallenge req.user, done.idCool
      xp.xpReward req.user, "challenge.create"
      sio.glob "fa fa-plus-square-o", "<a href=\"/u/" + req.user.idCool + "\" title=\"" + req.user.local.pseudo + "\">" + req.user.local.pseudo + "</a> created a <a href=\"/c/" + done.idCool + "\" title=\"" + done.title + "\">new challenge</a>."
      res.render "newChallenge.ejs",
        currentUser: req.user
        challenge: done

  app.post "/validateChallenge", isLoggedIn, (req, res) ->
    data =
      oId: req.body.id
      pass: req.body.pass

    if typeof data.pass is "boolean" or data.pass instanceof Boolean
      
      #Update the ongoing
      challenge.validateOngoing data, (done) ->
        
        # Ongoing has been updated;
        # if the answer was "pass", mean it wasn't accepted, don't let people rate the challenge (yet).
        if data.pass is true
          obj =
            id: done._idChallenge._id
            _idChallenged: done._idChallenged._id
            _idChallenger: done._idChallenger._id

          xp.xpReward done._idChallenger, "ongoing.validate"
          xp.xpReward done._idChallenged, "ongoing.succeed", done._idChallenge.value
          ioText = "<a href=\"/c/" + done._idChallenged.idCool + "\" title=\"" + done._idChallenged.local.pseudo + "\">" + done._idChallenged.local.pseudo + "</a> completed the challenge <a href=\"/c/" + done._idChallenge.idCool + "\" title=\"" + done._idChallenge.title + "\">" + done._idChallenge.title + "</a>!"
          sio.glob "glyphicon glyphicon-tower", ioText
          notifs.successChall done
          
          #automaticall share on Twitter if allowed
          if done._idChallenged.share.twitter is true and done._idChallenged.twitter.token
            twitt = "I just completed a challenge (http://goo.gl/gskvYu) on League of Legend! Join me now @cyf_app #challenge"
            social.postTwitter req.user.twitter, twitt, (data) ->
              text = "<a href=\"/u/" + done._idChallenged.idCool + "\" title=\"" + done._idChallenged.local.pseudo + "\">" + done._idChallenged.local.pseudo + "</a> shared his success on <a target=\"_blank\" href=\"https://twitter.com/" + data.user.screen_name + "/status/" + data.id_str + "\" title=\"see tweet\">@twitter</a>."
              sio.glob "fa fa-twitter", text
              ladder.actionInc req.user, "twitter"
          
          #Automatically share on facebook
          if done._idChallenged.share.facebook is true and done._idChallenged.facebook.token
            message =
              title: "I won a challenge threw by " + done._idChallenger.local.pseudo + "!"
              body: "Hurray! I just completed the challenge \"" + done.title + "\"\"  on Challenge Your friends! I won " + xp.getValue("ongoing.succeed") + "XP! http://localhost:8080/o/" + done.idCool

            social.postFbMessage done._idChallenged.facebook.token, message, "http://localhost:8080/o/" + done.idCool, (data) ->
              text = "<a href=\"/u/" + done._idChallenged.idCool + "\" title=\"" + done._idChallenged.local.pseudo + "\">" + done._idChallenged.local.pseudo + "</a> shared his success on facebook."
              sio.glob "fa fa-facebook", text
              ladder.actionInc req.user, "facebook"

          
          #Ask the challenger and challenged to rate the challenge.
          users.askRate obj, (done) ->
            res.send done

        else
          res.send true
    else
      res.send false, "not a boolean"


  # USER CHALLENGE TO BE RATED (ask opinion) ==================
  app.get "/rateChallenges", isLoggedIn, (req, res) ->
    users.userToRateChallenges req.user._id, (data) ->
      res.render "rateChallenge.ejs",
        currentUser: req.user
        challenge: data


  # PROFILE SECTION - USER Challenges =========================
  app.get "/myChallenges", isLoggedIn, (req, res) ->
    challenge.getUserChallenges req.user._id, (data) ->
      res.render "myChallenges.ejs",
        currentUser: req.user
        challenges: data

  # DELETE CHALLENGE SECTION =========================
  app.get "/removeChallenge/:id", isLoggedIn, (req, res) ->
    data = 
      id: req.params.id
      user: req.user
    challenge.delete data, (returned) ->
      res.redirect '/myChallenges'

  # LAUNCH A CHALLENGE REQUEST =======================
  app.get "/launchChallenge", isLoggedIn, (req, res) ->
    
    #Get the challenge list
    challenge.getList (challenges) ->
      
      #Get the users' friend list, because we need one which is up to date
      users.getUser req.user.idCool, (thisUser) ->
        console.log thisUser.friends
        res.render "launchChallenge.ejs",
          currentUser: req.user
          userList: thisUser.friends
          challenges: challenges

  app.post "/launchChallenge", isLoggedIn, (req, res) ->
    data =
      from: req.user._id
      idChallenged: req.body.idChallenged
      idChallenge: req.body.idChallenge
      deadLine: req.body.deadLine
      launchDate: req.body.launchDate

    notifs.launchChall data.from, data.idChallenged
    challenge.launch data, (result) ->
      res.send true

  # @TODO

  #Ask a challenge validation to another user
  app.post "/validationRequest", isLoggedIn, (req, res) ->
    img.googleUrl req.body.proofLink1, (imgUrl1) ->
      console.log "\nuploaded %s to %s", req.body.proofLink1, imgUrl1
      if req.body.proofLink2
        img.googleUrl req.body.proofLink2, (imgUrl2) ->
          console.log "\nuploaded %s to %s", req.body.proofLink2, imgUrl2
          data =
            idUser: req.user._id
            idChallenge: req.body.idChallenge
            proofLink1: imgUrl1
            proofLink2: imgUrl2
            confirmComment: req.body.confirmComment

          console.log data
          challenge.requestValidation data, (result) ->
            res.send result
      else
        data =
          idUser: req.user._id
          idChallenge: req.body.idChallenge
          proofLink1: imgUrl1
          proofLink2: imgUrl2
          confirmComment: req.body.confirmComment

        console.log data
        challenge.requestValidation data, (result) ->
          res.send result

  # =============================================================================
  # USERS PAGES (List and profiles===============================================
  # =============================================================================

  # User list
  app.get "/users", (req, res) ->
    users.getUserList (returned) ->
      res.render "userList.ejs",
        currentUser: (if (req.isAuthenticated()) then req.user else false)
        users: returned

  # leader board
  app.get "/leaderboard", (req, res) ->
    users.getLeaderboards "score", (returned) ->
      res.render "leaderBoard.ejs",
        currentUser: (if (req.isAuthenticated()) then req.user else false)
        ranking: returned

  app.get "/u/:id", (req, res) ->
    users.getUser req.params.id, (returned) ->
      console.log returned
      res.render "userDetails.ejs",
        currentUser: (if (req.isAuthenticated()) then req.user else false)
        user: returned
  # =============================================================================
  # AJAX CALLS ==================================================================
  # =============================================================================

  # Game autocomplete research
  app.get "/search_game", (req, res) ->
    lookFor = req.query["term"]
    games.regexFind lookFor, (returned) ->
      res.send returned.data,
        "Content-Type": "application/json"
      , returned.go

  app.get "/unlink/game_lol", isLoggedIn, (req, res) ->
    users.unlinkLol req.user._id, (result) ->
      console.log result
      res.redirect "/settings"

  app.post "/linkLol", isLoggedIn, (req, res) ->
    obj =
      _id: req.user._id
      region: req.body.region
      summonerName: req.body.summonerName

    users.linkLol obj, (result) ->
      if result is true
        xp.xpReward req.user, "connect.game"
        notifs.linkedGame req.user, "League of Legend"
        res.send true
      else
        res.send false

  app.post "/updateSettings", isLoggedIn, (req, res) ->
    obj =
      _id: req.user._id
      target: req.body.target
      value: req.body.value

    users.updateSettings obj, (result) ->
      res.send true

  app.post "/markNotifRead", isLoggedIn, (req, res) ->
    obj =
      idUser: req.user._id
      del: req.body.del
      idNotif: req.body.id
    console.log 'markNotifRead'

    notifs.markRead obj, (result) ->
      console.log result
      res.send true

#TODO
# idCool of the Ongoing

#A judge give his vote regarding to an open Tribunal's case
# idCool of the Ongoing
#Boolean false to deny, true to validate

#Loop and check if all vote have been processed. then close the case.

# Close the case

#If the case is validated

#Ask the challenger and challenged to rate the challenge.

#TODO

# console.log(obj);

#TODO

# a

# console.log(obj);

# console.log(obj);

#TODO

#TODO

# =============================================================================
# AUTHENTICATE (FIRST fnotif) ==================================================
# =============================================================================

# locally --------------------------------
# LOGIN ===============================
# show the login form

# process the login form
# redirect to the secure profile section
# redirect back to the signup page if there is an error
# allow flash messages

# SIGNUP =================================
# show the signup form

# process the signup form
# redirect to the secure profile section
# redirect back to the signup page if there is an error
# allow flash messages

# facebook -------------------------------

# send to facebook to do the authentication

# handle the callback after facebook has authenticated the user

# twitter --------------------------------

# send to twitter to do the authentication

# handle the callback after twitter has authenticated the user

# google ---------------------------------

# send to google to do the authentication

# the callback after google has authenticated the user

# =============================================================================
# AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
# =============================================================================

# locally --------------------------------
# redirect to the secure profile section
# redirect back to the signup page if there is an error
# allow flash messages

# facebook -------------------------------

# send to facebook to do the authentication

# handle the callback after facebook has authorized the user

# twitter --------------------------------

# send to twitter to do the authentication

# handle the callback after twitter has authorized the user

# google ---------------------------------

# send to google to do the authentication

# the callback after google has authorized the user

# =============================================================================
# UNLINK ACCOUNTS =============================================================
# =============================================================================
# used to unlink accounts. for social accounts, just remove the token
# for local account, remove email and password
# user account will stay active in case they want to reconnect in the future

# local -----------------------------------

# facebook -------------------------------

# twitter --------------------------------

# google ---------------------------------

# route middleware to ensure user is logged in
  app.post "/sendTribunal", isLoggedIn, (req, res) ->
    obj =
      idUser: req.user._id
      id: req.body.id

    challenge.sendTribunal obj, (result) ->
      res.send true
  app.post "/rateChallenges", isLoggedIn, (req, res) ->
    obj =
      id: req.body.id
      idUser: req.user._id
      difficulty: req.body.difficulty
      quickness: req.body.quickness
      fun: req.body.fun

    challenge.rateChallenge obj, (data) ->
      xp.xpReward req.user, "challenge.rate"
      notifs.ratedChall data
      res.send true

  app.post "/voteCase", isLoggedIn, (req, res) ->
    obj =
      id: req.body.id
      idUser: req.user._id
      answer: req.body.answer

    challenge.voteCase obj, (result) ->
      xp.xpReward req.user, "tribunal.vote"
      challenge.remainingCaseVotes obj.id, (counter) ->
        if counter is 0
          challenge.completeCase obj.id, (cases) ->
            obj =
              id: cases._idChallenge
              _idChallenged: cases._idChallenged
              _idChallenger: cases._idChallenger

            notifs.caseClosed cases
            if cases.tribunalAnswered is true
              ioText = " The tribunal validated the case <a href=\"/c/" + cases.idCool + "\" title=\"" + cases._idChallenge.title + "\">" + cases.idCool + "</a> for <a href=\"/c/" + cases._idChallenged.idCool + "\" title=\"" + cases._idChallenged.local.pseudo + "\">" + cases._idChallenged.local.pseudo + "</a>."
              sio.glob "fa fa-legal", ioText
            users.askRate obj, (done) ->
              res.send true
              return

            return

        else
          res.send true

  app.post "/askFriend", isLoggedIn, (req, res) ->
    idFriend = req.body.id
    idCoolFriend = req.body.idCool
    nameFriend = req.body.pseudo
    obj =
      from:
        id: req.user._id
        idCool: req.user.idCool
        userName: req.user.local.pseudo

      to:
        id: idFriend
        idCool: idCoolFriend
        userName: nameFriend

    notifs.askFriend req.user, obj.to
    users.askFriend obj, (result) ->
      res.send true

  app.post "/confirmFriend", isLoggedIn, (req, res) ->
    idFriend = req.body.id
    nameFriend = req.body.pseudo
    obj =
      from:
        id: idFriend
        userName: nameFriend

      to:
        id: req.user._id
        userName: req.user.local.pseudo

    relations.acceptRelation obj.from, obj.to, (result) ->
      xp.xpReward result[0], "user.newFriend"
      xp.xpReward result[1], "user.newFriend"
      notifs.nowFriends result
      sio.glob "fa fa-users", "<a href=\"/u/" + result[0].idCool + "\" title=\"" + result[0].local.pseudo + "\">" + result[0].local.pseudo + "</a> and <a href=\"/u/" + result[1].idCool + "\" title=\"" + result[1].local.pseudo + "\">" + result[1].local.pseudo + "</a> are now friends!"
      res.send true

  app.post "/cancelFriend", isLoggedIn, (req, res) ->
    idFriend = req.body.id
    nameFriend = req.body.pseudo
    obj =
      from:
        id: req.user._id
        userName: req.user.local.pseudo

      to:
        id: idFriend
        userName: nameFriend

    relations.cancelRelation obj.from, obj.to, (result) ->
      res.send true

  app.post "/denyFriend", isLoggedIn, (req, res) ->
    idFriend = req.body.id
    nameFriend = req.body.pseudo
    obj =
      from:
        id: idFriend
        userName: nameFriend

      to:
        id: req.user._id
        userName: req.user.local.pseudo

    relations.denyRelation obj.from, obj.to, (result) ->
      res.send true

  app.post "/acceptChallenge", isLoggedIn, (req, res) ->
    obj =
      id: req.body.id
      idUser: req.user._id

    challenge.accept obj, (result) ->
      xp.xpReward result._idChallenged, "ongoing.accept"
      xp.xpReward result._idChallenger, "ongoing.accept"
      notifs.acceptChall result._idChallenger, result._idChallenged
      ioText = "<a href=\"/u/" + result._idChallenged.idCool + "\" title=\"" + result._idChallenged.local.pseudo + "\">"
      ioText += result._idChallenged.local.pseudo + "</a> accepted <a href=\"/c/" + result._idChallenge.idCool + ">the challenge</a> of <a href=\"/u/"
      ioText += result._idChallenger.idCool + " title=\"" + result._idChallenger.local.pseudo + "\">" + result._idChallenger.local.pseudo + "</a>."
      sio.glob "fa fa-gamepad", ioText
      res.send true

  app.post "/denyChallenge", isLoggedIn, (req, res) ->
    obj =
      id: req.body.id
      idUser: req.user._id

    challenge.deny obj, (result) ->
      if result
        res.send true
      else
        console.log result

  app.get "/login", (req, res) ->
    res.render "login.ejs",
      message: req.flash("loginMessage")

  app.post "/login", passport.authenticate("local-login",
    successRedirect: "/profile"
    failureRedirect: "/login"
    failureFlash: true
  )
  app.get "/signup/:done?", (req, res) ->
    nowConfirm = (if req.params.done is "great" then true else false)
    res.render "signup.ejs",
      waitingConfirm: nowConfirm
      message: ""

  app.post "/signup", passport.authenticate("local-signup",
    successRedirect: "/signup/great"
    failureRedirect: "/signup"
    failureFlash: true
  )
  app.get "/auth/facebook", passport.authenticate("facebook",
    scope: [
      "email"
      "publish_actions"
    ]
  )
  app.get "/auth/facebook/callback", passport.authenticate("facebook",
    successRedirect: "/profile"
    failureRedirect: "/"
  )
  app.get "/auth/twitter", passport.authenticate("twitter")
  app.get "/auth/twitter/callback", passport.authenticate("twitter",
    successRedirect: "/profile"
    failureRedirect: "/"
  )
  app.get "/auth/google", passport.authenticate("google",
    scope: [
      "profile"
      "email"
    ]
  )
  app.get "/auth/google/callback", passport.authenticate("google",
    successRedirect: "/profile"
    failureRedirect: "/"
  )
  app.get "/connect/local", (req, res) ->
    res.render "connect-local.ejs",
      message: req.flash("loginMessage")

  app.post "/connect/local", passport.authenticate("local-signup",
    successRedirect: "/profile"
    failureRedirect: "/connect/local"
    failureFlash: true
  )
  app.get "/connect/facebook", passport.authorize("facebook",
    scope: [
      "email"
      "publish_actions"
    ]
  )
  app.get "/connect/facebook/callback", passport.authorize("facebook",
    successRedirect: "/profile"
    failureRedirect: "/"
  )
  app.get "/connect/twitter", passport.authorize("twitter",
    scope: "email"
  )
  app.get "/connect/twitter/callback", passport.authorize("twitter",
    successRedirect: "/profile"
    failureRedirect: "/"
  )
  app.get "/connect/google", passport.authorize("google",
    scope: [
      "profile"
      "email"
    ]
  )
  app.get "/connect/google/callback", passport.authorize("google",
    successRedirect: "/profile"
    failureRedirect: "/"
  )
  app.get "/unlink/local", (req, res) ->
    user = req.user
    user.local.email = `undefined`
    user.local.password = `undefined`
    user.local.pseudo = `undefined`
    user.save (err) ->
      res.redirect "/profile"

  app.get "/unlink/facebook", (req, res) ->
    user = req.user
    user.facebook.token = `undefined`
    user.save (err) ->
      res.redirect "/profile"

  app.get "/unlink/twitter", (req, res) ->
    user = req.user
    user.twitter.token = `undefined`
    user.save (err) ->
      res.redirect "/profile"

  app.get "/unlink/google", (req, res) ->
    user = req.user
    user.google.token = `undefined`
    user.save (err) ->
      res.redirect "/profile"