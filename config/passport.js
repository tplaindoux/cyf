// Generated by CoffeeScript 1.7.1
(function() {
  var FacebookStrategy, GoogleStrategy, LocalStrategy, TwitterStrategy, User, challenge, configAuth, grvtr, social;

  LocalStrategy = require("passport-local").Strategy;

  FacebookStrategy = require("passport-facebook").Strategy;

  TwitterStrategy = require("passport-twitter").Strategy;

  GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

  User = require("../app/models/user");

  challenge = require("../config/challenge");

  grvtr = require('grvtr');

  social = require("../config/social");

  configAuth = require("./auth");

  module.exports = function(passport, genUID, xp, notifs, mailer, shortUrl) {
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
        done(err, user);
      });
    });
    passport.use("local-login", new LocalStrategy({
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    }, function(req, email, password, done) {
      console.log('bouya');
      return process.nextTick(function() {
        return User.findOne({
          "local.email": email
        }, function(err, userfound) {
          if (err) {
            return done(err);
          }
          if (!userfound) {
            return done(null, false, req.flash("loginMessage", "No user found."));
          }
          if (!userfound.validPassword(password)) {
            return done(null, false, req.flash("loginMessage", "Oops! Wrong password."));
          } else {
            if (configAuth.app_config.email_confirm) {
              if (!userfound.verified) {
                return done(null, false, req.flash("loginMessage", "Please confirm your email adress before entering the arena."));
              }
            }
            console.log('logged');
            req.session.isLogged = true;
            req.session.user = userfound;
            userfound.isOnline = true;
            return userfound.save(function(err) {
              if (err) {
                throw err;
              }
              notifs.login(userfound);
              return done(null, userfound);
            });
          }
        });
      });
    }));
    passport.use("local-signup", new LocalStrategy({
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    }, function(req, email, password, done) {
      var uID, uIDHash;
      uID = genUID.generate().substr(-6);
      uIDHash = genUID.generate().substr(-12);
      process.nextTick(function() {
        var user;
        if (!req.user) {
          User.findOne({
            "local.email": email
          }, function(err, user) {
            var newUser;
            if (err) {
              return done(err);
            }
            if (user) {
              done(null, false, req.flash("signupMessage", "That email is already taken."));
            } else {
              newUser = new User();
              newUser.idCool = uID;
              newUser.userRand = [Math.random(), 0];
              newUser.verfiy_hash = uIDHash;
              if (!configAuth.app_config.email_confirm) {
                newUser.verified = true;
              }
              newUser.local.email = email;
              newUser.local.password = newUser.generateHash(password);
              newUser.local.friends = [];
              newUser.local.pseudo = req.body.pseudo;
              newUser.local.sentRequests = [];
              newUser.local.pendingRequests = [];
              newUser.local.followers = [];
              grvtr.create(email, {
                size: 150,
                defaultImage: "identicon",
                rating: "g"
              }, function(gravatarUrl) {
                console.log(gravatarUrl);
                newUser.icon = gravatarUrl;
                newUser.save(function(err, user) {
                  if (err) {
                    throw err;
                  }
                  return mailer.accountConfirm(user, function(returned) {
                    if (!configAuth.app_config.email_confirm) {
                      req.session.user = user;
                      req.session.isLogged = true;
                      req.session.newUser = true;
                    }
                    xp.xpReward(user, "user.register");
                    return done(null, newUser);
                  });
                });
              });
            }
          });
        } else {
          user = req.user;
          user.local.email = email;
          user.local.password = user.generateHash(password);
          user.local.pseudo = req.body.pseudo;
          user.save(function(err) {
            if (err) {
              throw err;
            }
            return done(null, user);
          });
        }
      });
    }));
    passport.use(new FacebookStrategy({
      clientID: configAuth.facebookAuth.clientID,
      clientSecret: configAuth.facebookAuth.clientSecret,
      callbackURL: configAuth.facebookAuth.callbackURL,
      passReqToCallback: true
    }, function(req, token, refreshToken, profile, done) {
      process.nextTick(function() {
        var user;
        if (!req.user) {
          User.findOne({
            "facebook.id": profile.id
          }, function(err, user) {
            var newUser;
            if (err) {
              return done(err);
            }
            if (user) {
              if (!user.facebook.token) {
                user.facebook.token = token;
                user.facebook.name = profile.name.givenName + " " + profile.name.familyName;
                user.facebook.email = profile.emails[0].value;
                user.save(function(err) {
                  if (err) {
                    throw err;
                  }
                  return done(null, user);
                });
              }
              done(null, user);
            } else {
              newUser = new User();
              newUser.facebook.id = profile.id;
              newUser.facebook.token = token;
              newUser.facebook.name = profile.name.givenName + " " + profile.name.familyName;
              newUser.facebook.email = profile.emails[0].value;
              newUser.save(function(err) {
                if (err) {
                  throw err;
                }
                return done(null, newUser);
              });
            }
          });
        } else {
          user = req.user;
          user.facebook.id = profile.id;
          user.facebook.token = token;
          user.facebook.name = profile.name.givenName + " " + profile.name.familyName;
          user.facebook.email = profile.emails[0].value;
          user.save(function(err) {
            if (err) {
              throw err;
            }
            return done(null, user);
          });
        }
      });
    }));
    passport.use(new TwitterStrategy({
      consumerKey: configAuth.twitterAuth.consumerKey,
      consumerSecret: configAuth.twitterAuth.consumerSecret,
      callbackURL: configAuth.twitterAuth.callbackURL,
      passReqToCallback: true
    }, function(req, token, tokenSecret, profile, done) {
      process.nextTick(function() {
        var user;
        if (!req.user) {
          User.findOne({
            "twitter.id": profile.id
          }, function(err, user) {
            var newUser;
            if (err) {
              return done(err);
            }
            if (user) {
              user.twitter.token = token;
              user.twitter.tokenSecret = tokenSecret;
              user.twitter.username = profile.username;
              user.twitter.displayName = profile.displayName;
              user.save(function(err) {
                var profileUrl;
                if (err) {
                  throw err;
                }
                profileUrl = configAuth.cyf.domain + '/' + user.idCool;
                return shortUrl.googleUrl(profileUrl, function(shortened) {
                  var twitt;
                  console.log("New twitter linked %s to %s", profileUrl, shortened);
                  if (configAuth.twitterPushNews) {
                    twitt = "Welcome @" + user.twitter.username + " (" + shortened + ") on Challenge your Friends! You are " + user.level + ", a journey awaits you! @cyf_app #challenge";
                    return social.postTwitter(configAuth.twitterCyf, twitt, function(data) {
                      return done(null, user);
                    });
                  }
                });
              });
            } else {
              newUser = new User();
              newUser.twitter.id = profile.id;
              newUser.twitter.token = token;
              newUser.twitter.tokenSecret = tokenSecret;
              newUser.twitter.username = profile.username;
              newUser.twitter.displayName = profile.displayName;
              newUser.save(function(err) {
                if (err) {
                  throw err;
                }
                return done(null, newUser);
              });
            }
          });
        } else {
          user = req.user;
          user.twitter.id = profile.id;
          user.twitter.token = token;
          user.twitter.tokenSecret = tokenSecret;
          user.twitter.username = profile.username;
          user.twitter.displayName = profile.displayName;
          user.save(function(err) {
            if (err) {
              throw err;
            }
            console.log(user);
            return done(null, user);
          });
        }
      });
    }));
    passport.use(new GoogleStrategy({
      clientID: configAuth.googleAuth.clientID,
      clientSecret: configAuth.googleAuth.clientSecret,
      callbackURL: configAuth.googleAuth.callbackURL,
      passReqToCallback: true
    }, function(req, token, refreshToken, profile, done) {
      process.nextTick(function() {
        var user;
        if (!req.user) {
          User.findOne({
            "google.id": profile.id
          }, function(err, user) {
            var newUser;
            if (err) {
              return done(err);
            }
            if (user) {
              if (!user.google.token) {
                user.google.token = token;
                user.google.name = profile.displayName;
                user.google.email = profile.emails[0].value;
                user.save(function(err) {
                  if (err) {
                    throw err;
                  }
                  return done(null, user);
                });
              }
              done(null, user);
            } else {
              newUser = new User();
              newUser.google.id = profile.id;
              newUser.google.token = token;
              newUser.google.name = profile.displayName;
              newUser.google.email = profile.emails[0].value;
              newUser.save(function(err) {
                if (err) {
                  throw err;
                }
                return done(null, newUser);
              });
            }
          });
        } else {
          user = req.user;
          user.google.id = profile.id;
          user.google.token = token;
          user.google.name = profile.displayName;
          user.google.email = profile.emails[0].value;
          user.save(function(err) {
            if (err) {
              throw err;
            }
            return done(null, user);
          });
        }
      });
    }));
  };

}).call(this);
