// Generated by CoffeeScript 1.7.1
(function() {
  var Challenge, User;

  User = require("../app/models/user");

  Challenge = require("../app/models/challenge");

  module.exports = function(_, mailer) {
    return {

      /*
      Return the current pending requests for a given user
      @param  {String}   idUser [user's id]
      @param  {Function} done   [description]
      @return {Object}          [List of ongoing requests]
       */
      getPending: function(idUser, done) {
        return Relation.findOne({
          idUser: idUser
        }).exec(function(err, data) {
          if (err) {
            mailer.cLog('Error at ' + __filename, err);
          }
          return done(data.pendingRequests);
        });
      },

      /*
      Create or update a relation with either a sending invite or pending one
      @param  {String}   from       [id of the sender]
      @param  {String}   to         [id of the receiver]
      @param  {Boolean}   thisIsSend [true or false]
      @param  {Function} done       [callback]
      @return {Boolean}              [true or false]
       */
      create: function(from, to, thisIsSend, done) {
        var pushing, query;
        if (thisIsSend) {
          pushing = "sentRequests";
          query = {
            $push: {
              sentRequests: {
                idUser: to.id,
                idCool: to.idCool,
                userName: to.userName
              }
            }
          };
        } else {
          pushing = "pendingRequests";
          query = {
            $push: {
              pendingRequests: {
                idUser: to.id,
                idCool: to.idCool,
                userName: to.userName
              }
            }
          };
        }
        return User.findOne({
          _id: from.id,
          $or: [
            {
              "sentRequests.idUser": to.id
            }, {
              "pendingRequests.idUser": to.id
            }
          ]
        }).exec(function(err, relation) {
          if (err) {
            mailer.cLog('Error at ' + __filename, err);
          }
          if (!relation) {
            return User.findByIdAndUpdate(from.id, query).exec(function(err, updated) {
              done(true);
            });
          } else {
            return done(false, "already asked");
          }
        });
      },

      /*
      Accept a relation: add a new row and delete the pending ones
      @param  {[type]}   from [description]
      @param  {[type]}   to   [description]
      @param  {Function} done [description]
      @return {[type]}        [description]
       */
      acceptRelation: function(from, to, done) {
        return User.findById(from.id, function(err, user) {
          var testReq, testUnit;
          testReq = _.map(user.sentRequests, function(u) {
            return u.idUser.toString();
          });
          testReq = _.contains(testReq, to.id.toString());
          testUnit = _.pluck(user.friends, 'idCool');
          testUnit = _.contains(testUnit, to.idCool);
          if (testReq) {
            if (!testUnit) {
              return User.findByIdAndUpdate(from.id, {
                $pull: {
                  sentRequests: {
                    idUser: to.id
                  }
                },
                $push: {
                  friends: {
                    idUser: to.id,
                    idCool: to.idCool,
                    userName: to.userName
                  }
                }
              }, function(err, relationFrom) {
                if (err) {
                  mailer.cLog('Error at ' + __filename, err);
                }
                return User.findByIdAndUpdate(to.id, {
                  $pull: {
                    pendingRequests: {
                      idUser: from.id
                    }
                  },
                  $push: {
                    friends: {
                      idUser: from.id,
                      idCool: to.idCool,
                      userName: from.userName
                    }
                  }
                }, function(err, relationTo) {
                  var newRelation;
                  if (err) {
                    mailer.cLog('Error at ' + __filename, err);
                  }
                  newRelation = [relationFrom, relationTo];
                  return done([true, newRelation]);
                });
              });
            } else {
              return done([false, 'relation already exists']);
            }
          } else {
            return done([false, 'relation is not pending.']);
          }
        });
      },
      unFriend: function(from, to, done) {
        return User.findById(from.id, function(err, user) {
          var testFriends;
          testFriends = _.map(user.friends, function(u) {
            return u.idUser.toString();
          });
          console.log(testFriends, to.id);
          testFriends = _.contains(testFriends, to.id.toString());
          console.log(testFriends);
          if (testFriends) {
            return User.findByIdAndUpdate(from.id, {
              $pull: {
                pendingRequests: {
                  idUser: to.id
                }
              }
            }, function(err, relation) {
              if (err) {
                mailer.cLog('Error at ' + __filename, err);
              }
              console.log(relation.pendingRequests, err);
              return User.findByIdAndUpdate(to.id, {
                $pull: {
                  sentRequests: {
                    idUser: from.id
                  }
                }
              }, function(err, relation) {
                if (err) {
                  mailer.cLog('Error at ' + __filename, err);
                }
                console.log(relation.sentRequests, err);
                return done([true, '']);
              });
            });
          } else {
            return done([false, 'You are not friends.']);
          }
        });
      },

      /*
      Deny a relation: delete the pending one from whom denied it.
      @param  {[type]}   from [description]
      @param  {[type]}   to   [description]
      @param  {Function} done [description]
      @return {[type]}        [description]
       */
      denyRelation: function(from, to, done) {
        return User.findById(from.id, function(err, user) {
          var testReq;
          testReq = _.map(user.sentRequests, function(u) {
            return u.idUser.toString();
          });
          console.log(testReq, to.id);
          testReq = _.contains(testReq, to.id.toString());
          console.log(testReq);
          if (testFriends) {
            return User.findByIdAndUpdate(to.id, {
              $pull: {
                sentRequests: {
                  idUser: from.id
                }
              }
            }, function(err, relation) {
              if (err) {
                mailer.cLog('Error at ' + __filename, err);
              }
              console.log(relation.sentRequests, err);
              return done([true, '']);
            });
          } else {
            return done([false, 'This relation is not existing.']);
          }
        });
      }
    };
  };

}).call(this);
