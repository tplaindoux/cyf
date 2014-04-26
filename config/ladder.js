// Generated by CoffeeScript 1.7.1
(function() {
  var User, getScore;

  User = require("../app/models/user");

  getScore = function(data, done) {
    var finalScore;
    finalScore = void 0;
    finalScore = (data.xp * (1 + data.level)) + (250 * data.shareTW) + (250 * data.shareFB);
    return done(finalScore);
  };

  module.exports = function(async, schedule, mailer, _, sio, ladder, moment, social, appKeys, xp, notifs, users) {
    return {
      getLeaderboards: function(type, scale, safe, done) {
        var qs, query, self, where;
        self = this;
        if (safe === true) {
          qs = '-friends -userRand -verfiy_hash -local.email -local.password -sessionKey -facebook.email -google.email -twitter.tokenSecret -notifications -sentRequests -pendingRequests -tribunal -tribunalHistoric -challengeRateHistoric';
        } else {
          qs = '-notifications -friends -challengeRateHistoric';
        }
        if (type === "score") {
          if (scale === 'global') {
            query = '-globalScore level';
            where = 'globalScore';
          } else {
            query = scale + "Rank level";
            where = scale + "Rank";
          }
          return User.find({}).where(where).gte(1).sort(query).select(qs).exec(function(err, challengers) {
            if (err) {
              mailer.cLog('Error at ' + __filename, err);
            }
            return done(challengers);
          });
        }
      },
      rankUser: function(type, callback) {
        var hash, qs, sort, sorting, typeTxt;
        typeTxt = type === 1 ? 'today' : type === 2 ? 'the last Week' : 'the last Month';
        hash = type === 1 ? '#dailyLadder' : type === 2 ? '#weeklyLadder' : '#monthlyLadder';
        sorting = type === 1 ? 'dailyScore' : type === 2 ? 'weeklyScore' : 'monthlyScore';
        qs = ' -local.email -sessionKey -notifications -sentRequests -pendingRequests -tribunal -tribunalHistoric -challengeRateHistoric';
        sort = '-' + sorting + ' -level';
        return User.find({}).select(qs).sort(sort).where(sorting).gte(1).exec(function(err, userSorted) {
          var buffed, index, leaders;
          if (err) {
            mailer.cLog('Error at ' + __filename, err);
          }
          buffed = [];
          leaders = [];
          index = 0;
          if (userSorted.length > 0) {
            return async.eachSeries(userSorted, (function(user, next) {
              var ranked;
              ranked = ++index;
              console.log('[' + typeTxt + '] Updating ' + user.local.pseudo + ' who will now be ranked ' + ranked + ' ' + sorting + ' : ' + user.dailyScore);
              User.findById(user._id).exec(function(err, user) {
                var archives;
                if (err) {
                  mailer.cLog('Error at ' + __filename, err);
                }
                archives = type === 1 ? user.dailyArchives[user.dailyArchives.length - 1] : type === 2 ? user.weeklyArchives[user.weeklyArchives.length - 1] : user.monthlyArchives[user.monthlyArchives.length - 1];
                if (type === 1) {
                  user.dailyRank = ranked;
                } else if (type === 2) {
                  user.weeklyRank = ranked;
                } else {
                  user.monthlyRank = ranked;
                }
                return user.save(function(err) {
                  if (err) {
                    mailer.cLog('Error at ' + __filename, err);
                  }
                  console.log(user.local.pseudo + ' who was ' + archives.rank + ' is now #' + user.dailyRank);
                  if (ranked < 4) {
                    leaders.push(user);
                  }
                  return next();
                });
              });
            }), function(err) {
              callback(leaders);
            });
          } else {
            console.log('no new leader for yesterday!');
            return callback(leaders);
          }
        });
      },
      scoreUpdate: function(type, user, done) {
        var lastData, typeTxt;
        typeTxt = type === 1 ? 'Today' : type === 2 ? 'last Week' : 'last Month';
        lastData = type === 1 ? user.daily : type === 2 ? user.weekly : user.monthly;
        return getScore(lastData, function(score) {
          var prepareGlobal;
          console.log("[" + typeTxt + "] new score for " + user.local.pseudo + " " + typeTxt + " is " + score);
          prepareGlobal = {
            xp: user.xp,
            level: user.level,
            shareTW: user.global.shareTW,
            shareFB: user.global.shareFB
          };
          return getScore(prepareGlobal, function(globalScore) {
            console.log("[" + typeTxt + "] new global score for " + user.local.pseudo + " is " + globalScore);
            return User.findById(user._id).exec(function(err, user) {
              var pushToArchives;
              if (err) {
                mailer.cLog('Error at ' + __filename, err);
              }
              user.globalScore = globalScore;
              pushToArchives = {};
              if (type === 1) {
                pushToArchives.xp = user.xp;
                pushToArchives.level = user.level;
                pushToArchives.shareFB = user.daily.shareFB;
                pushToArchives.shareTW = user.daily.shareTW;
                pushToArchives.score = user.dailyScore;
                pushToArchives.rank = user.dailyRank;
                user.dailyScore = score;
                user.daily.xp = 0;
                user.daily.level = 0;
                user.daily.shareFB = 0;
                user.daily.shareTW = 0;
                user.dailyArchives.push(pushToArchives);
              }
              if (type === 2) {
                pushToArchives.xp = user.xp;
                pushToArchives.level = user.level;
                pushToArchives.shareFB = user.weekly.shareFB;
                pushToArchives.shareTW = user.weekly.shareTW;
                pushToArchives.score = user.weeklyScore;
                pushToArchives.rank = user.weeklyRank;
                user.weeklyScore = score;
                user.weekly.xp = 0;
                user.weekly.level = 0;
                user.weekly.shareFB = 0;
                user.weekly.shareTW = 0;
                user.weeklyArchives.push(pushToArchives);
              }
              if (type === 3) {
                pushToArchives.xp = user.xp;
                pushToArchives.level = user.level;
                pushToArchives.shareFB = user.monthly.shareFB;
                pushToArchives.shareTW = user.monthly.shareTW;
                pushToArchives.score = user.monthlyScore;
                pushToArchives.rank = user.monthlyRank;
                user.monthlyScore = score;
                user.monthly.xp = 0;
                user.monthly.level = 0;
                user.monthly.shareFB = 0;
                user.monthly.shareTW = 0;
                user.monthlyArchives.push(pushToArchives);
              }
              return user.save(function(err) {
                if (err) {
                  mailer.cLog('Error at ' + __filename, err);
                }
                return done(user);
              });
            });
          });
        });
      },
      generateLadder: function(type, callback) {
        var self, typeTxt;
        typeTxt = type === 1 ? 'Today' : type === 2 ? 'last Week' : 'last Month';
        self = this;
        return User.find({}).sort("-_id").exec(function(err, usersList) {
          if (err) {
            mailer.cLog('Error at ' + __filename, err);
          }
          return async.eachSeries(usersList, (function(user, next) {
            self.scoreUpdate(type, user, function(done) {
              var currScore;
              currScore = type === 1 ? 'D-' + done.dailyScore : type === 2 ? 'W-' + done.weeklyScore : 'M-' + done.monthlyScore;
              console.log("[" + typeTxt + "] User " + done.local.pseudo + " has been updated " + currScore + " g " + done.globalScore);
              return next();
            });
          }), function(err) {
            callback();
          });
        });
      },
      actionInc: function(user, action) {
        var query;
        query = void 0;
        if (action === "twitter") {
          query = {
            "daily.shareTW": 1,
            "weekly.shareTW": 1,
            "monthly.shareTW": 1,
            "global.shareTW": 1
          };
        } else if (action === "facebook") {
          query = {
            "daily.shareFB": 1,
            "weekly.shareFB": 1,
            "monthly.shareFB": 1,
            "global.shareFB": 1
          };
        } else {
          query = false;
        }
        if (query) {
          return User.findByIdAndUpdate(user._id, {
            $inc: query
          }).exec(function(err, userUpdated) {
            if (err) {
              return mailer.cLog('Error at ' + __filename, err);
            }
          });
        }
      },
      userSocialPush: function(user, type, typeTxt, hash, index, done) {
        var action, uTweet, _self;
        _self = this;
        if (type === 1) {
          uTweet = 'Yea! I am now ranked ' + user.dailyRank + ' on the #CyfLadder of ' + typeTxt + ', that\'s great! @' + appKeys.twitterCyf.username + ' ' + hash;
          if (typeof user.facebook.token !== 'undefined' && user.share.facebook === true) {
            action = {
              name: 'rank',
              link: appKeys.cyf.app_domain + '/u/' + user.idCool,
              message: "This is #awesome! I am now ranked #" + user.dailyRank + " on Challenge your friends! Who could dare challenging me on any game now haha?! The competition is here http://goo.gl/MofE3n! " + hash,
              ladder: {
                title: ranked
              }
            };
            return social.userAction(user, action, function() {
              mailer.sendMail(user, user.local.pseudo + ' Congratulation, you are now ranked #' + user.dailyRank + ' on Cyf', '<p>Wow, you were able to reach the <strong>' + user.dailyRank + ' place</strong> on the ladder for ' + typeTxt + '. Amazing!</p><p>Stay strong, share and don\'t forget to have FUN on Challenge your Friends(Cyf)</p> <p><a href="http://goo.gl/MofE3n" target="_blank" title="See the leaderboard" > See Live </a></p>', true, 'ladder_' + ranked);
              _self.actionInc(user, "facebook");
              if (typeof user.twitter.token !== 'undefined' && user.share.twitter === true) {
                return social.postTwitter(user.twitter, uTweet, function() {
                  _self.actionInc(user, "twitter");
                  return done();
                });
              } else {
                return done();
              }
            });
          } else if (typeof user.twitter.token !== 'undefined' && user.share.twitter === true) {
            return social.postTwitter(user.twitter, uTweet, function() {
              _self.actionInc(user, "twitter");
              return done();
            });
          } else {
            return done();
          }
        } else if (type === 2) {
          uTweet = 'Yea! I am now ranked ' + user.weeklyRank + ' on the #CyfLadder of ' + typeTxt + ', that\'s great! @' + appKeys.twitterCyf.username + ' ' + hash;
          if (typeof user.facebook.token !== 'undefined' && user.share.facebook === true) {
            action = {
              name: 'rank',
              link: appKeys.cyf.app_domain + '/u/' + user.idCool,
              message: "This is #awesome! I am now ranked #" + user.weeklyRank + " on Challenge your friends! Who could dare challenging me on any game now haha?! The competition is here http://goo.gl/MofE3n! " + hash,
              ladder: {
                title: ranked
              }
            };
            return social.userAction(user, action, function() {
              mailer.sendMail(user, user.local.pseudo + ' Congratulation, you are now ranked #' + user.weeklyRank + ' on Cyf', '<p>Wow, you were able to reach the <strong>' + user.weeklyRank + ' place</strong> on the ladder for ' + typeTxt + '. Amazing!</p><p>Stay strong, share and don\'t forget to have FUN on Challenge your Friends(Cyf)</p> <p><a href="http://goo.gl/MofE3n" target="_blank" title="See the leaderboard" > See Live </a></p>', true, 'ladder_' + ranked);
              _self.actionInc(user, "facebook");
              if (typeof user.twitter.token !== 'undefined' && user.share.twitter === true) {
                return social.postTwitter(user.twitter, uTweet, function() {
                  _self.actionInc(user, "twitter");
                  return done();
                });
              } else {
                return done();
              }
            });
          } else if (typeof user.twitter.token !== 'undefined' && user.share.twitter === true) {
            return social.postTwitter(user.twitter, uTweet, function() {
              _self.actionInc(user, "twitter");
              return done();
            });
          } else {
            return done();
          }
        } else {
          uTweet = 'Yea! I am now ranked ' + user.monthlyRank + ' on the #CyfLadder of ' + typeTxt + ', that\'s great! @' + appKeys.twitterCyf.username + ' ' + hash;
          if (typeof user.facebook.token !== 'undefined' && user.share.facebook === true) {
            action = {
              name: 'rank',
              link: appKeys.cyf.app_domain + '/u/' + user.idCool,
              message: "This is #awesome! I am now ranked #" + user.monthlyRank + " on Challenge your friends! Who could dare challenging me on any game now haha?! The competition is here http://goo.gl/MofE3n! " + hash,
              ladder: {
                title: ranked
              }
            };
            return social.userAction(user, action, function() {
              mailer.sendMail(user, user.local.pseudo + ' Congratulation, you are now ranked #' + user.monthlyRank + ' on Cyf', '<p>Wow, you were able to reach the <strong>' + user.monthlyRank + ' place</strong> on the ladder for ' + typeTxt + '. Amazing!</p><p>Stay strong, share and don\'t forget to have FUN on Challenge your Friends(Cyf)</p> <p><a href="http://goo.gl/MofE3n" target="_blank" title="See the leaderboard" > See Live </a></p>', true, 'ladder_' + ranked);
              _self.actionInc(user, "facebook");
              if (typeof user.twitter.token !== 'undefined' && user.share.twitter === true) {
                return social.postTwitter(user.twitter, uTweet, function() {
                  _self.actionInc(user, "twitter");
                  return done();
                });
              } else {
                return done();
              }
            });
          } else if (typeof user.twitter.token !== 'undefined' && user.share.twitter === true) {
            return social.postTwitter(user.twitter, uTweet, function() {
              _self.actionInc(user, "twitter");
              return done();
            });
          } else {
            return done();
          }
        }
      },
      spreadUsersSocial: function(type, cb) {
        var hash, qs, sorting, typeTxt, _self;
        _self = this;
        typeTxt = type === 1 ? 'Today' : type === 2 ? 'last Week' : 'last Month';
        hash = type === 1 ? '#dailyLadder' : type === 2 ? '#weeklyLadder' : '#monthlyLadder';
        sorting = type === 1 ? 'dailyScore' : type === 2 ? 'weeklyScore' : 'monthlyScore';
        qs = ' -local.email -sessionKey -notifications -sentRequests -pendingRequests -tribunal -tribunalHistoric -challengeRateHistoric -dailyArchives -weeklyArchives -monthlyArchives';
        return User.find({}).select(qs).sort('-_id').where(sorting).gte(1).exec(function(err, userSorted) {
          var index;
          index = 0;
          return async.eachSeries(userSorted, (function(user, next) {
            ++index;
            _self.userSocialPush(user, type, typeTxt, hash, index, function(done) {
              return next();
            });
          }), function(err) {
            cb();
          });
        });
      },
      spreadLadder: function(top3, type, done) {
        var fbWall, lastMonth, lastWeek, nFFB, nLFb, newFollower, newLeader, notifText, tweet, typeoff, yesterday;
        if (type === 1) {
          yesterday = moment().subtract('d', 1).format("ddd Do MMM");
          typeoff = 'daily';
        }
        if (type === 2) {
          lastWeek = moment().subtract('w', 1).format("w");
          typeoff = 'weekly';
        }
        if (type === 3) {
          lastMonth = moment().subtract('m', 1).format("MMMM GGGG");
          typeoff = 'monthly';
        }
        newLeader = '';
        nLFb = '';
        newFollower = '';
        nFFB = '';
        _.each(top3, function(user) {
          var archives, diff, diffIcon, lastTime, notif, ranked, uText, variable, wasRanked;
          if (type === 1) {
            archives = user.dailyArchives || [];
            ranked = user.dailyRank;
          }
          if (type === 2) {
            archives = user.weeklyArchives || [];
            ranked = user.weeklyRank;
          }
          if (type === 3) {
            archives = user.monthlyArchives || [];
            ranked = user.monthlyRank;
          }
          diff = 0;
          wasRanked = false;
          if (archives.length > 0) {
            lastTime = archives.length - 1;
            diff = archives[lastTime].rank - ranked;
            wasRanked = archives[lastTime].rank > 0 ? true : false;
          }
          diffIcon = diff > 0 ? 'arrow-up' : diff === 0 ? 'minus' : 'arrow-down';
          diff = Math.abs(diff);
          variable = wasRanked ? '<i class="fa fa-' + diffIcon + '"></i> ' + diff : 'previously unranked';
          uText = user.local.pseudo + ' is now ranked <strong>' + ranked + '</strong>, ' + variable + ' on the ' + typeoff + ' <i class="fa fa-list"></i>. ';
          sio.glob("fa fa-star", uText);
          notif = {
            type: 'newLadderRank',
            idFrom: user._id,
            from: 'Challenge Master',
            link1: './leaderboard',
            title: 'Congratulation!! You are now ranked ' + ranked,
            icon: 'fa fa-star',
            to: '',
            link2: '',
            message: ''
          };
          notifs.newNotif([user._id], true, notif);
          if (ranked === 1) {
            newLeader += user.local.pseudo + (user.twitter.username ? ' (@' + user.twitter.username + ')' : '');
            nLFb += user.local.pseudo;
          }
          if (ranked === 2) {
            newFollower += 'and ' + user.local.pseudo + ' 2nd' + (user.twitter.username ? ' (@' + user.twitter.username + ') 2nd' : '');
            return nFFB += 'and ' + user.local.pseudo + ' for his/her 2nd place';
          }
        });
        if (type === 1) {
          tweet = "New daily ranking " + yesterday + " live! GG " + newLeader + " 1st " + newFollower + "!! http://goo.gl/MofE3n #CyfLadder #CYFDaily.";
          fbWall = "The daily #ranking for yesterday " + yesterday + " is now live! Congratulation to our new leader " + nLFb + " " + nFFB + "! See the leaderboard here: http://goo.gl/MofE3n #CyfLadder #CYFDaily";
        } else if (type === 2) {
          tweet = "Weekly ranking " + lastWeek + " live! GG " + newLeader + " 1st " + newFollower + "! http://goo.gl/MofE3n #CyfLadder #CYFWeekly";
          fbWall = "Our weekly #ranking for the week " + lastWeek + " is now live! Congratulation to our new leader " + nLFb + " " + nFFB + "! See the leaderboard here: http://goo.gl/MofE3n #CyfLadder #CYFWeekly";
        } else {
          tweet = "New ranking for " + lastMonth + ": 1st " + newLeader + " " + newFollower + " GG! http://goo.gl/MofE3n #CyfLadder #CYFMonthly";
          fbWall = "The #ranking for " + lastMonth + " is now available! Our deepest congratulations to the leader of the past month " + nLFb + " " + nFFB + "! You can see the leaderboard here: http://goo.gl/MofE3n #CyfLadder #CYFMonthly";
        }
        if (appKeys.app_config.twitterPushNews === true) {
          return social.postTwitter(false, tweet, function(tweetD) {
            var notifText, sLink;
            if (tweetD.user) {
              sLink = '<a target="_blank" href="https://twitter.com/' + tweetD.user.screen_name + '/status/' + tweetD.id_str + '" title="see tweet"><i class="fa fa-twitter"></i></a>';
              if (appKeys.app_config.facebookPushNews === true) {
                return social.updateWall(fbWall, false, function(dataFB) {
                  var fLink, notifText;
                  fLink = '<a target="_blank" href="https://www.facebook.com/cyfapp/posts/' + dataFB.id + '" title="see facebook post"><i class="fa fa-facebook"></i></a>';
                  if (type === 1) {
                    notifText = 'The daily ranking for yesterday <a href="./leaderboard" title="leaderboard">is live</a>! ' + sLink + ' ' + fLink + '.';
                  }
                  if (type === 2) {
                    notifText = 'The weekly ranking <strong>' + lastWeek + '</strong> <a href="./leaderboard" title="leaderboard">is live</a>!  ' + sLink + ' ' + fLink + '.';
                  }
                  if (type === 3) {
                    notifText = 'The ranking for ' + lastMonth + ' <a href="./leaderboard" title="leaderboard">is now available</a>!  ' + sLink + ' ' + fLink + '.';
                  }
                  sio.glob("fa fa-list", notifText);
                  return done('ranking ' + typeoff + ' updated. <br>' + notifText);
                });
              } else {
                if (type === 1) {
                  notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>! ' + sLink + '.';
                }
                if (type === 2) {
                  notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>! ' + sLink + '.';
                }
                if (type === 3) {
                  notifText = 'The ranking for <strong>' + lastMonth + '</strong> <a href="./leaderboard" title="leaderboard">is live</a>! ' + sLink + '.';
                }
                sio.glob("fa fa-list", notifText);
                return done('ranking ' + typeoff + ' updated <br> ' + notifText);
              }
            } else {
              mailer.cLog('Twitter push l.366 at ' + __filename, tweetD);
              return done('ranking ' + typeoff + ' updated <br> ' + notifText);
            }
          });
        } else if (appKeys.app_config.facebookPushNews === true) {
          return social.updateWall(fbWall, false, function(dataFB) {
            var fLink, notifText;
            fLink = '<a target="_blank" href="https://www.facebook.com/cyfapp/posts/' + dataFB.id + '" title="see facebook post"><i class="fa fa-facebook"></i></a>';
            if (type === 1) {
              notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>! ' + fLink + '.';
            }
            if (type === 2) {
              notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>! ' + fLink + '.';
            }
            if (type === 3) {
              notifText = 'The ranking for <strong>' + lastMonth + '</strong> <a href="./leaderboard" title="leaderboard">is live</a>! ' + fLink + '.';
            }
            sio.glob("fa fa-list", notifText);
            return done('ranking ' + typeoff + ' updated <br> ' + notifText);
          });
        } else {
          if (type === 1) {
            notifText = 'The ranking of yesterday <a href="./leaderboard" title="leaderboard">is live</a>!';
          }
          if (type === 2) {
            notifText = 'The ranking for the week #' + lastWeek + ' <a href="./leaderboard" title="leaderboard">is live</a>!';
          }
          if (type === 3) {
            notifText = 'The ranking for <strong>' + lastMonth + '</strong> <a href="./leaderboard" title="leaderboard">is live</a>!';
          }
          sio.glob("fa fa-list", notifText);
          return done('ranking ' + typeoff + ' updated <br> ' + notifText);
        }
      }
    };
  };

}).call(this);
