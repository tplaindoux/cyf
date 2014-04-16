// Generated by CoffeeScript 1.7.1

/*
Let's define our raw formulas

xpFormula = (level^2+level)/2*100-(level*100),
levelFormula = (sqrt(100(2 xp +25))+50)/100,
 */

(function() {
  var User, getLevel, getXp, xpRewardAction, xpRewardvalue;

  User = require("../models/user");

  xpRewardvalue = {
    "connect.game": 100,
    "user.register": 55,
    "user.newFriend": 60,
    "user.inviteFB": 75,
    "challenge.create": 110,
    "challenge.rate": 60,
    "ongoing.accept": 60,
    "ongoing.validate": 150,
    "ongoing.succeed": 330,
    "tribunal.vote": 80
  };

  xpRewardAction = {
    "connect.game": "linking a game account",
    "user.register": "creating an account",
    "user.newFriend": "making a new friend",
    "user.inviteFB": "Inviting friends from Facebook",
    "challenge.create": "creating a new challenge",
    "challenge.rate": "rating a challenge",
    "ongoing.accept": "accepting a challenge",
    "ongoing.validate": "validating a challenge",
    "ongoing.succeed": "completing successfully a challenge",
    "tribunal.vote": "voting on a case in the Tribunal"
  };

  getLevel = function(xp) {
    var process;
    process = Math.round((Math.sqrt(100 * (2 * xp + 25)) + 50) / 100);
    return process;
  };

  getXp = function(level) {
    var process;
    process = (((Math.pow(level, 2) + level) / 2) * 100) - (level * 100);
    return process;
  };

  module.exports = function(_, mailer, notifs, sio) {
    return {

      /*
      Return the value of an action
      @param  {[type]} action [description]
      @return {[type]}        [description]
       */
      getValue: function(action) {
        return _.values(_.pick(xpRewardvalue, action))[0];
      },
      isUp: function(xp, level) {
        var bugCheck, curLvL, flatten, nextXpReq, xpNeeded;
        curLvL = level;
        xpNeeded = getXp(curLvL + 1);
        bugCheck = getXp(curLvL + 2);
        nextXpReq = xpNeeded - xp;
        if (xp > xpNeeded) {
          nextXpReq = bugCheck - xp;
          if (xp > bugCheck) {
            flatten = getLevel(xp) - curLvL;
            nextXpReq = getXp(flatten + curLvL) - xp;
            return [flatten, nextXpReq];
          } else {
            return [1, nextXpReq];
          }
        } else {
          return [false, nextXpReq];
        }
      },
      xpReward: function(user, action, xtime, bonus) {
        var inc, levelUp, multiply, newXp, uLvl, uXp, userDoubleXp, value, valueNext, valueNext2;
        userDoubleXp = (user.xpDouble ? true : false);
        bonus = (bonus ? bonus : 0);
        multiply = xtime ? xtime : 1;
        value = (_.values(_.pick(xpRewardvalue, action))[0] * multiply * (userDoubleXp ? 2 : 1)) + bonus;
        uXp = user.xp;
        uLvl = user.level;
        valueNext = getXp(uLvl + 1);
        valueNext2 = getXp(uLvl + 2);
        newXp = uXp + value;
        levelUp = this.isUp(newXp, uLvl);
        if (levelUp[0]) {
          inc = {
            level: levelUp[0],
            xp: value,
            "daily.xp": value,
            "daily.level": levelUp[0],
            "weekly.xp": value,
            "weekly.level": levelUp[0],
            "monthly.xp": value,
            "monthly.level": levelUp[0]
          };
        } else {
          inc = {
            xp: value,
            "daily.xp": value,
            "weekly.xp": value,
            "monthly.xp": value
          };
        }
        return User.findByIdAndUpdate(user._id, {
          $inc: inc,
          $set: {
            xpNext: levelUp[1]
          }
        }).exec(function(err, userUpdated) {
          var text;
          if (err) {
            mailer.cLog('Error at ' + __filename, err);
          }
          text = _.values(_.pick(xpRewardAction, action))[0];
          if (levelUp[0]) {
            notifs.gainedLevel(userUpdated, uLvl + 1);
            notifs.levelUp(userUpdated);
            sio.glob("fa fa-angle-double-up", " <a href=\"/u/" + userUpdated.idCool + "\">" + userUpdated.local.pseudo + "</a> is now level " + userUpdated.level + " <i class=\"fa fa-exclamation\"></i>");
          }
          return notifs.gainedXp(userUpdated, value, bonus, text);
        });
      },
      updateDaily: function(done) {
        return User.find().exec(function(err, users) {
          if (err) {
            mailer.cLog('Error at ' + __filename, err);
          }
          return _.each(users, (function(_this) {
            return function(user) {
              var garbage;
              garbage = {
                xp: user.xp,
                level: user.level
              };
              return User.findByIdAndUpdate(user._id, {
                $push: {
                  xpHistoric: garbage
                }
              }).exec(function(err, userUpdated) {
                if (err) {
                  mailer.cLog('Error at ' + __filename, err);
                }
                return done(true);
              });
            };
          })(this));
        });
      }
    };
  };

}).call(this);
