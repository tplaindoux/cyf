// Generated by CoffeeScript 1.7.1
(function() {
  module.exports = function(schedule, mailer, _, sio, ladder, moment, social, appKeys, xp, notifs) {
    var dailyLadder, dailyRanking, monthlyLadder, monthlyRanking, weekLadder, weeklyRanking, xpLevel, xpLevelUpdate;
    xpLevelUpdate = new schedule.RecurrenceRule();
    xpLevelUpdate.hour = [13, 23];
    xpLevelUpdate.minute = 30;
    xpLevelUpdate.seconds = 0;
    xpLevel = schedule.scheduleJob(xpLevelUpdate, function() {
      console.log('xpLevel update start');
      return xp.updateDaily(function(result) {
        return mailer.cLog('[Cyf-auto] Daily xp update done', result);
      });
    });
    dailyRanking = new schedule.RecurrenceRule();
    dailyRanking.hour = 12;
    dailyRanking.minute = 0;
    dailyRanking.seconds = 0;
    dailyLadder = schedule.scheduleJob(dailyRanking, function() {
      var daily;
      console.log('dailyLadder');
      daily = 1;
      return ladder.generateLadder(daily, function() {
        return ladder.rankUser(daily, function(top3) {
          return ladder.spreadUsersSocial(daily, function() {
            return ladder.spreadLadder(top3, daily, function(done) {
              return mailer.cLog('[Cyf-auto] Daily Ladder for ' + moment().subtract('d', 1).format("ddd Do MMM"), done);
            });
          });
        });
      });
    });
    weeklyRanking = new schedule.RecurrenceRule();
    weeklyRanking.dayOfWeek = 1;
    weeklyRanking.hour = 1;
    weeklyRanking.minute = 1;
    weeklyRanking.seconds = 0;
    weekLadder = schedule.scheduleJob(weeklyRanking, function() {
      var weekly;
      weekly = 2;
      return ladder.generateLadder(weekly, function() {
        return ladder.rankUser(weekly, function(top3) {
          return ladder.spreadUsersSocial(weekly, function() {
            return ladder.spreadLadder(top3, weekly, function(done) {
              return mailer.cLog('[Cyf-auto] Weekly Ladder for ' + moment().subtract('w', 1).format("w"), done);
            });
          });
        });
      });
    });
    monthlyRanking = new schedule.RecurrenceRule();
    monthlyRanking.date = 1;
    monthlyRanking.hour = 1;
    monthlyRanking.minute = 10;
    monthlyRanking.seconds = 0;
    return monthlyLadder = schedule.scheduleJob(monthlyRanking, function() {
      var monthly;
      monthly = 3;
      return ladder.generateLadder(monthly, function() {
        return ladder.rankUser(monthly, function(top3) {
          return ladder.spreadUsersSocial(monthly, function() {
            return ladder.spreadLadder(top3, monthly, function(done) {
              return mailer.cLog('[Cyf-auto] Monthly Ladder for ' + moment().subtract('m', 1).format("MMMM GGGG"), done);
            });
          });
        });
      });
    });
  };

}).call(this);
