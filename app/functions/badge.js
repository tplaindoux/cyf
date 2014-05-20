// Generated by CoffeeScript 1.7.1
(function() {
  var Badge, User;

  Badge = require("../models/badge");

  User = require("../models/user");

  module.exports = function(async, _, mailer, notifs, sio) {
    return {
      getList: function(done) {
        return Badge.find().sort('_id').exec(function(err, list) {
          if (err) {
            mailer.cLog('Error at ' + __filename, err);
          }
          return done(list);
        });
      },
      getNonUnlocked: function(user, done) {
        return Badge.find({
          ownedBy: {
            $nin: [user._id]
          }
        }).sort('_id').exec(function(err, list) {
          if (err) {
            mailer.cLog('Error at ' + __filename, err);
          }
          return done(list);
        });
      },
      create: function(title, desc, icon, reqBadges, requirement, done) {
        var newBadge, requiredBadges;
        if (reqBadges) {
          if (_.isArray(reqBadges)) {
            requiredBadges = reqBadges;
          } else {
            requiredBadges = [reqBadges];
          }
        }
        newBadge = new Badge();
        newBadge.title = title;
        newBadge.icon = icon;
        newBadge.description = desc;
        newBadge.reqBadges = requiredBadges;
        if (requirement) {
          if (_.isArray(requirement)) {
            newBadge.requirement = requirement;
          } else {
            newBadge.requirement = [requirement];
          }
        }
        console.log(newBadge);
        return newBadge.save(function(err) {
          if (err) {
            mailer.cLog('Error at ' + __filename, err);
          }
          if (err) {
            console.log(err);
          }
          if (err) {
            done([false, err]);
          }
          return done([true, newBadge]);
        });
      },
      tryUnlock: function(badges, user, done) {
        var _this;
        console.log('tryUnlock', badges, user.local.pseudo);
        _this = this;
        if (_.isArray(badges)) {
          return async.eachSeries(badges, (function(badge, next) {
            console.log('eachSeries', badge);
            _this.testUnique(badge, user, function(result) {
              console.log('testUnique result ', result, badge);
              if (result === true) {
                return _this.unlock(badge, user, function(unlocked) {
                  if (unlocked === true) {
                    console.log('new badge pushed');
                    return next();
                  } else {
                    console.log('new badge push failed');
                    return next();
                  }
                });
              } else {
                return next();
              }
            });
          }), function(err) {
            done();
          });
        } else {
          return _this.testUnique(badges, user, function(result) {
            console.log('testUnique result ', result, badges);
            if (result === true) {
              return _this.unlock(badges, user, function(result) {
                if (result === true) {
                  console.log('new badge pushed');
                  return done();
                } else {
                  console.log('new badge push failed');
                  return done();
                }
              });
            } else {
              return done();
            }
          });
        }
      },
      unlock: function(badgeId, user, done) {
        console.log('unlocking', badgeId, user.local.pseudo);
        return User.findByIdAndUpdate(user._id, {
          $addToSet: {
            badges: {
              idBadge: badgeId
            }
          }
        }, function(err, userUpdated) {
          if (err) {
            mailer.cLog('Error at ' + __filename, err);
          }
          if (err) {
            console.log(err);
          }
          console.log(userUpdated.badges);
          return Badge.findByIdAndUpdate(badgeId, {
            $addToSet: {
              ownedBy: user._id
            }
          }, function(err, upBadge) {
            if (err) {
              mailer.cLog('Error at ' + __filename, err);
            }
            if (err) {
              console.log(err);
            }
            console.log(upBadge.ownedBy);
            if (err) {
              done(false);
            }
            return done(true);
          });
        });
      },
      testUnique: function(id, user, done) {
        console.log('testUnique', id, user.local.pseudo);
        return Badge.findById(id).exec(function(err, badge) {
          var ownedBadges, pass, testBR;
          testBR = true;
          pass = true;
          if (!_.isEmpty(badge.reqBadges)) {
            ownedBadges = _.pluck(user.badges, 'idBadge');
            console.log(badge.reqBadges, ownedBadges);
            _.each(badge.reqBadges, function(reqBadge) {
              console.log(reqBadge, ' is contained in:', ownedBadges);
              if (!_.contains(ownedBadges, reqBadge)) {
                return testBR = false;
              }
            });
          }
          console.log('test badge dependecy result:', testBR);
          if (testBR === true) {
            console.log('badge Req: ', badge.requirement);
            _.each(badge.requirement, function(required) {
              var minValue, reqType;
              reqType = required.reqType;
              minValue = required.reqValue;
              console.log('test Req: ', reqType, minValue);
              switch (reqType) {
                case 'level':
                  console.log('level test:', user.level + '>=' + minValue, user.level >= minValue);
                  if (user.level < minValue) {
                    pass = false;
                  }
                  break;
                case 'friend':
                  console.log('friends test:', user.friends.length + '>=' + minValue, user.level >= minValue);
                  console.log('friends  test:', user.friends.length + '>=' + minValue);
                  if (user.friends.length < minValue) {
                    pass = false;
                  }
                  break;
                default:
                  console.log('unwritten test:', reqType);
                  pass = false;
              }
              return console.log('test Req results: ', pass);
            });
            if (pass === true) {
              return done(true);
            } else {
              return done(false);
            }
          } else {
            return done(false);
          }
        });
      },
      withdraw: function(badgeId, user, done) {
        return User.findByIdAndUpdate(user._id, {
          $pull: {
            badge: {
              idBadge: badgeId
            }
          }
        }).exec(function(err, userUpdated) {
          if (err) {
            console.log(err);
          }
          return done(true);
        });
      }
    };
  };

}).call(this);