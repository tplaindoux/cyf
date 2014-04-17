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
      getLeaderboards: function(type, scale, done) {
        var query, self, where;
        self = this;
        if (type === "score") {
          if (scale === 'global') {
            query = '-globalScore';
            where = 'globalScore';
          } else {
            query = scale + "Rank";
            where = scale + "Score";
          }
          return User.find({}).sort(query).where(where).gte(0).select("-notifications -friends -challengeRateHistoric").exec(function(err, challengers) {
            if (err) {
              mailer.cLog('Error at ' + __filename, err);
            }
            return done(challengers);
          });
        }
      },
      rankUser: function(type, callback) {
        var hash, sort, sorting, typeTxt;
        typeTxt = type === 1 ? 'yesterday' : type === 2 ? 'the last Week' : 'the last Month';
        hash = type === 1 ? '#dailyLadder' : type === 2 ? '#weeklyLadder' : '#monthlyLadder';
        sorting = type === 1 ? 'dailyScore' : type === 2 ? 'weeklyScore' : 'monthlyScore';
        sort = '-' + sorting;
        return User.find({}).sort(sort).exec(function(err, userSorted) {
          var buffed, leaders;
          if (err) {
            mailer.cLog('Error at ' + __filename, err);
          }
          buffed = [];
          leaders = [];
          _.each(userSorted, function(user, index) {
            return buffed.push({
              id: index,
              u: user,
              tt: typeTxt,
              h: hash,
              s: sorting
            });
          });
          return async.eachSeries(buffed, (function(dataU, cb) {
            var ranked, user;
            user = dataU.u;
            ranked = dataU.id + 1;
            typeTxt = dataU.tt;
            hash = dataU.h;
            console.log('[' + typeTxt + '] Updating ' + user.local.pseudo + ' who will now be ranked ' + ranked);
            User.findById(user._id).exec(function(err, user) {
              var action, archives, uTweet;
              if (err) {
                mailer.cLog('Error at ' + __filename, err);
              }
              archives = type === 1 ? user.dailyArchives[user.dailyArchives.length - 1] : type === 2 ? user.weeklyArchives[user.weeklyArchives.length - 1] : user.monthlyArchives[user.monthlyArchives.length - 1];
              if (type === 1) {
                user.dailyRank = ranked;
                if (typeof user.facebook.token !== 'undefined' && user.share.facebook === true) {
                  action = {
                    name: 'rank',
                    link: appKeys.cyf.app_domain + '/u/' + user.idCool,
                    message: "This is #awesome! I am now ranked #" + ranked + " on Challenge your friends! Who could dare challenging me on any game now haha?! The competition is here http://goo.gl/MofE3n! " + hash,
                    ladder: {
                      title: ranked
                    }
                  };
                  social.userAction(user, action, function(cb) {
                    return mailer.sendMail(user, user.local.pseudo + ' Congratulation, you are now ranked #' + ranked + ' on Cyf', '<p>Wow, you were able to reach the <strong>' + ranked + ' place</strong> on the ladder for ' + typeTxt + '. Amazing!</p><p>Stay strong, share and don\'t forget to have FUN on Challenge your Friends(Cyf)</p> <p><a href="http://goo.gl/MofE3n" target="_blank" title="See the leaderboard" > See Live </a></p>', true, 'ladder_' + ranked);
                  });
                }
                if (typeof user.twitter.token !== 'undefined' && user.share.twitter === true) {
                  uTweet = 'Yea! I am now ranked ' + ranked + ' on the #CyfLadder of ' + typeTxt + ', that\'s great! @' + appKeys.twitterCyf.username + ' ' + hash;
                  social.postTwitter(user.twitter, uTweet, function(cb) {});
                }
              } else if (type === 2) {
                user.weeklyRank = ranked;
                if (typeof user.facebook.token !== 'undefined' && user.share.facebook === true) {
                  action = {
                    name: 'rank',
                    link: appKeys.cyf.app_domain + '/u/' + user.idCool,
                    ladder: {
                      title: ranked
                    }
                  };
                  social.userAction(user, action, function(cb) {
                    var obj;
                    obj = {
                      name: "I ranked " + ranked,
                      description: user.local.pseudo + ' is now ranked ' + ranked + ' for ' + typeTxt + ' leaderboard on Challenge your friends',
                      message: "This is #awesome! I am now ranked #" + ranked + " among the challengers of #cyfapp. Well, I hope I will be able to keep things up and keep reaching the top, but the competition is here http://goo.gl/MofE3n! " + hash
                    };
                    return social.userActionWallPost(user, obj, function(cb) {
                      return mailer.sendMail(user, user.local.pseudo + ' Congratulation, you are now ranked #' + ranked + ' on Cyf', '<p>Wow, you were able to reach the <strong>' + ranked + ' place</strong> on the ladder for ' + typeTxt + '. Amazing!</p><p>Stay strong, share and don\'t forget to have FUN on Challenge your Friends(Cyf)</p> <p><a href="http://goo.gl/MofE3n" target="_blank" title="See the leaderboard" > See Live </a></p>', true, 'ladder_' + ranked);
                    });
                  });
                }
                if (typeof user.twitter.token !== 'undefined' && user.share.twitter === true) {
                  uTweet = 'Yea! I am now ranked ' + ranked + ' on the #CyfLadder of ' + typeTxt + ', that\'s great! @' + appKeys.twitterCyf.username + ' ' + hash;
                  social.postTwitter(user.twitter, uTweet, function(cb) {});
                }
              } else {
                user.monthlyRank = ranked;
                if (typeof user.facebook.token !== 'undefined' && user.share.facebook === true) {
                  action = {
                    name: 'rank',
                    link: appKeys.cyf.app_domain + '/u/' + user.idCool,
                    ladder: {
                      title: ranked
                    }
                  };
                  social.userAction(user, action, function(cb) {
                    var obj;
                    obj = {
                      name: "I ranked " + ranked,
                      description: user.local.pseudo + ' is now ranked ' + ranked + ' for ' + typeTxt + ' leaderboard on Challenge your friends',
                      message: "This is #awesome! I am now ranked #" + ranked + " among the challengers of #cyfapp. Well, I hope I will be able to keep things up and keep reaching the top, but the competition is here http://goo.gl/MofE3n! " + hash
                    };
                    return social.userActionWallPost(user, obj, function(cb) {
                      return mailer.sendMail(user, user.local.pseudo + ' Congratulation, you are now ranked #' + ranked + ' on Cyf', '<p>Wow, you were able to reach the <strong>' + ranked + ' place</strong> on the ladder for ' + typeTxt + '. Amazing!</p><p>Stay strong, share and don\'t forget to have FUN on Challenge your Friends(Cyf)</p> <p><a href="http://goo.gl/MofE3n" target="_blank" title="See the leaderboard" > See Live </a></p>', true, 'ladder_' + ranked);
                    });
                  });
                }
                if (typeof user.twitter.token !== 'undefined' && user.share.twitter === true) {
                  uTweet = 'Yea! I am now ranked ' + ranked + ' on the #CyfLadder of ' + typeTxt + ', that\'s great! @' + appKeys.twitterCyf.username + ' ' + hash;
                  social.postTwitter(user.twitter, uTweet, function(cb) {});
                }
              }
              return user.save(function(err) {
                console.log(user.local.pseudo + ' who was ' + archives.rank + ' is now #' + user.dailyRank);
                if (err) {
                  mailer.cLog('Error at ' + __filename, err);
                }
                if (ranked < 4) {
                  leaders.push(user);
                }
                return cb();
              });
            });
          }), function(err) {
            if (err) {
              console.log("There was an error" + err);
            } else {
              console.log('Got the new leaders: ' + leaders.length);
              callback(leaders);
            }
          });
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
              if (err) {
                mailer.cLog('Error at ' + __filename, err);
              }
              user.globalScore = globalScore;
              if (type === 1) {
                lastData.day = moment().subtract("days", 1).day();
                user.dailyScore = score;
                user.daily.xp = 0;
                user.daily.level = 0;
                user.daily.shareFB = 0;
                user.daily.shareTW = 0;
                user.dailyArchives.push(lastData);
              }
              if (type === 2) {
                lastData.week = moment().subtract("weeks", 1).week();
                user.weeklyScore = score;
                user.weekly.xp = 0;
                user.weekly.level = 0;
                user.weekly.shareFB = 0;
                user.weekly.shareTW = 0;
                lastData.rank = user.weeklyRank;
                user.weeklyArchives.push(lastData);
              }
              if (type === 3) {
                lastData.month = moment().subtract("months", 1).month();
                user.monthlyScore = score;
                user.monthly.xp = 0;
                user.monthly.level = 0;
                user.monthly.shareFB = 0;
                user.monthly.shareTW = 0;
                lastData.rank = user.monthlyRank;
                user.monthlyArchives.push(lastData);
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
          return async.eachSeries(usersList, (function(user, cb) {
            self.scoreUpdate(type, user, function(done) {
              var currScore;
              currScore = type === 1 ? 'D-' + done.dailyScore : type === 2 ? 'W-' + done.weeklyScore : 'M-' + done.monthlyScore;
              return console.log("[" + typeTxt + "] User " + done.local.pseudo + " has been updated " + currScore + " g " + done.globalScore);
            });
            cb();
          }), function(err) {
            if (err) {
              console.log("There was an error" + err);
            } else {
              callback();
            }
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
          tweet = "New daily ranking " + yesterday + " up! GG " + newLeader + " 1st " + newFollower + "!! http://goo.gl/3VjsJd #CyfLadder #CYFDaily.";
          fbWall = "The daily #ranking for yesterday " + yesterday + " is now live! Congratulation to our new leader " + nLFb + " " + nFFB + "! See the leaderboard here: http://goo.gl/3VjsJd #CyfLadder #CYFDaily";
        } else if (type === 2) {
          tweet = "Weekly ranking " + lastWeek + " live! GG " + newLeader + " 1st " + newFollower + "! http://goo.gl/3VjsJd #CyfLadder #CYFWeekly";
          fbWall = "Our weekly #ranking for the week " + lastWeek + " is now live! Congratulation to our new leader " + nLFb + " " + nFFB + "! See the leaderboard here: http://goo.gl/3VjsJd #CyfLadder #CYFWeekly";
        } else {
          tweet = "New ranking for " + lastMonth + ": 1st " + newLeader + " " + newFollower + " GG! http://goo.gl/3VjsJd #CyfLadder #CYFMonthly";
          fbWall = "The #ranking for " + lastMonth + " is now available! Our deepest congratulations to the leader of the past month " + nLFb + " " + nFFB + "! You can see the leaderboard here: http://goo.gl/3VjsJd #CyfLadder #CYFMonthly";
        }
        if (appKeys.app_config.twitterPushNews === true) {
          return social.postTwitter(false, tweet, function(tweetD) {
            var notifText, sLink;
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
