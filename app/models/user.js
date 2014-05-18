// Generated by CoffeeScript 1.7.1
(function() {
  var bcrypt, mongoose, userSchema;

  mongoose = require("mongoose");

  bcrypt = require("bcrypt-nodejs");

  userSchema = mongoose.Schema({
    tutorialCompleted: {
      type: Boolean,
      "default": false
    },
    verfiy_hash: {
      type: String,
      required: true
    },
    icon: String,
    verified: {
      type: Boolean,
      "default": false
    },
    idCool: {
      type: String,
      index: true
    },
    userRand: {
      lat: Number,
      lng: Number
    },
    isOnline: {
      type: Boolean,
      "default": false
    },
    level: {
      type: Number,
      "default": 1
    },
    xpDouble: {
      type: Boolean,
      "default": false
    },
    xp: {
      type: Number,
      "default": 0
    },
    xpHistoric: [
      {
        xp: {
          type: Number,
          "default": 0
        },
        level: {
          type: Number,
          "default": 0
        },
        date: {
          type: Date,
          "default": Date.now
        }
      }
    ],
    xpNext: {
      type: Number,
      "default": 100
    },
    dailyRank: {
      type: Number,
      "default": 0
    },
    dailyScore: {
      type: Number,
      "default": 0
    },
    daily: {
      xp: {
        type: Number,
        "default": 0
      },
      level: {
        type: Number,
        "default": 0
      },
      shareFB: {
        type: Number,
        "default": 0
      },
      shareTW: {
        type: Number,
        "default": 0
      }
    },
    dailyArchives: [
      {
        rank: {
          type: Number,
          "default": 0
        },
        score: {
          type: Number,
          "default": 0
        },
        xp: {
          type: Number,
          "default": 0
        },
        level: {
          type: Number,
          "default": 0
        },
        shareFB: {
          type: Number,
          "default": 0
        },
        shareTW: {
          type: Number,
          "default": 0
        },
        date: {
          type: Date,
          "default": Date.now
        }
      }
    ],
    weeklyRank: {
      type: Number,
      "default": 0
    },
    weeklyScore: {
      type: Number,
      "default": 0
    },
    weekly: {
      xp: {
        type: Number,
        "default": 0
      },
      level: {
        type: Number,
        "default": 0
      },
      shareFB: {
        type: Number,
        "default": 0
      },
      shareTW: {
        type: Number,
        "default": 0
      }
    },
    weeklyArchives: [
      {
        rank: {
          type: Number,
          "default": 0
        },
        xp: {
          type: Number,
          "default": 0
        },
        level: {
          type: Number,
          "default": 0
        },
        shareFB: {
          type: Number,
          "default": 0
        },
        shareTW: {
          type: Number,
          "default": 0
        },
        date: {
          type: Date,
          "default": Date.now
        }
      }
    ],
    monthlyRank: {
      type: Number,
      "default": 0
    },
    monthlyScore: {
      type: Number,
      "default": 0
    },
    monthly: {
      xp: {
        type: Number,
        "default": 0
      },
      level: {
        type: Number,
        "default": 0
      },
      shareFB: {
        type: Number,
        "default": 0
      },
      shareTW: {
        type: Number,
        "default": 0
      }
    },
    monthlyArchives: [
      {
        rank: {
          type: Number,
          "default": 0
        },
        xp: {
          type: Number,
          "default": 0
        },
        level: {
          type: Number,
          "default": 0
        },
        shareFB: {
          type: Number,
          "default": 0
        },
        shareTW: {
          type: Number,
          "default": 0
        },
        date: {
          type: Date,
          "default": Date.now
        }
      }
    ],
    globalScore: {
      type: Number,
      "default": 0
    },
    global: {
      shareFB: {
        type: Number,
        "default": 0
      },
      shareTW: {
        type: Number,
        "default": 0
      }
    },
    share: {
      facebook: {
        type: Boolean,
        "default": true
      },
      twitter: {
        type: Boolean,
        "default": true
      }
    },
    local: {
      email: String,
      password: String,
      pseudo: String,
      joinDate: {
        type: Date,
        "default": Date.now
      }
    },
    sessionKey: String,
    leagueoflegend: {
      confirmed: {
        type: Boolean,
        "default": false
      },
      idProfile: Number,
      name: String,
      region: String,
      profileIconId: Number,
      profileIconId_confirm: {
        type: Number,
        "default": 0
      },
      revisionDate: Date,
      summonerLevel: Number,
      lastUpdated: {
        type: Date,
        "default": Date.now
      },
      linkedOnce: {
        type: Boolean,
        "default": true
      },
      lastGames: [
        {
          championId: Number,
          createDate: String,
          championInfos: {
            id: Number,
            title: String,
            name: String,
            key: String
          },
          fellowPlayers: [
            {
              championId: Number,
              summonerId: Number,
              teamId: Number
            }
          ],
          gameId: Number,
          gameMode: String,
          gameType: String,
          invalid: Boolean,
          ipEarned: Number,
          level: Number,
          mapId: Number,
          spell1: Number,
          spell2: Number,
          stats: {
            assists: Number,
            barracksKilled: Number,
            championsKilled: Number,
            combatPlayerScore: Number,
            consumablesPurchased: Number,
            damageDealtPlayer: Number,
            doubleKills: Number,
            firstBlood: Number,
            gold: Number,
            goldEarned: Number,
            goldSpent: Number,
            item0: Number,
            item1: Number,
            item2: Number,
            item3: Number,
            item4: Number,
            item5: Number,
            item6: Number,
            itemsPurchased: Number,
            killingSprees: Number,
            largestCriticalStrike: Number,
            largestKillingSpree: Number,
            largestMultiKill: Number,
            legendaryItemsCreated: Number,
            level: Number,
            magicDamageDealtPlayer: Number,
            magicDamageDealtToChampions: Number,
            magicDamageTaken: Number,
            minionsDenied: Number,
            minionsKilled: Number,
            neutralMinionsKilled: Number,
            neutralMinionsKilledEnemyJungle: Number,
            neutralMinionsKilledYourJungle: Number,
            nexusKilled: Number,
            nodeCapture: Number,
            nodeCaptureAssist: Number,
            nodeNeutralize: Number,
            nodeNeutralizeAssist: Number,
            numDeaths: Number,
            numItemsBought: Number,
            objectivePlayerScore: Number,
            pentaKills: Number,
            physicalDamageDealtPlayer: Number,
            physicalDamageDealtToChampions: Number,
            physicalDamageTaken: Number,
            quadraKills: Number,
            sightWardsBought: Number,
            spell1Cast: Number,
            spell2Cast: Number,
            spell3Cast: Number,
            spell4Cast: Number,
            summonSpell1Cast: Number,
            summonSpell2Cast: Number,
            superMonsterKilled: Number,
            team: Number,
            teamObjective: Number,
            timePlayed: Number,
            totalDamageDealt: Number,
            totalDamageDealtToChampions: Number,
            totalDamageTaken: Number,
            totalHeal: Number,
            totalPlayerScore: Number,
            totalScoreRank: Number,
            totalTimeCrowdControlDealt: Number,
            totalUnitsHealed: Number,
            tripleKills: Number,
            trueDamageDealtPlayer: Number,
            trueDamageDealtToChampions: Number,
            trueDamageTaken: Number,
            turretsKilled: Number,
            unrealKills: Number,
            victoryPointTotal: Number,
            visionWardsBought: Number,
            wardKilled: Number,
            wardPlaced: Number,
            win: Boolean
          },
          subType: String,
          teamId: Number
        }
      ]
    },
    fbInvitedFriends: [Number],
    facebook: {
      id: String,
      token: String,
      email: String,
      name: String
    },
    twitter: {
      id: String,
      token: String,
      tokenSecret: String,
      displayName: String,
      username: String
    },
    google: {
      id: String,
      token: String,
      email: String,
      name: String
    },
    notifications: [
      {
        idFrom: {
          type: mongoose.Schema.Types.ObjectId,
          index: true,
          ref: "User"
        },
        icon: {
          type: String,
          "default": "fa fa-bell"
        },
        from: {
          type: String,
          "default": ""
        },
        to: {
          type: String,
          "default": ""
        },
        title: {
          type: String,
          "default": ""
        },
        date: {
          type: Date,
          "default": Date.now
        },
        message: {
          type: String,
          "default": ""
        },
        link1: {
          type: String,
          "default": ""
        },
        link2: {
          type: String,
          "default": ""
        },
        notificationType: {
          type: String,
          "default": "info"
        },
        persist: {
          type: Boolean,
          "default": false
        },
        type: {
          type: String,
          "default": "simple"
        },
        isSeen: {
          type: Boolean,
          "default": false
        }
      }
    ],
    games: [
      {
        _idGame: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Game"
        },
        title: {
          type: String
        },
        type: {
          type: String
        },
        favorite: {
          type: Boolean,
          "default": false
        },
        date: {
          type: Date,
          "default": Date.now
        }
      }
    ],
    badges: [
      {
        idBadge: {
          type: Number,
          index: true,
          ref: "Badge"
        },
        dateUnlocked: {
          type: Date,
          "default": Date.now
        }
      }
    ],
    friends: [
      {
        idUser: {
          type: mongoose.Schema.Types.ObjectId,
          index: true,
          ref: "User"
        },
        idCool: String,
        date: {
          type: Date,
          "default": Date.now
        },
        userName: String
      }
    ],
    sentRequests: [
      {
        idUser: {
          type: mongoose.Schema.Types.ObjectId,
          index: true,
          ref: "User"
        },
        idCool: String,
        date: {
          type: Date,
          "default": Date.now
        },
        userName: String
      }
    ],
    pendingRequests: [
      {
        idUser: {
          type: mongoose.Schema.Types.ObjectId,
          index: true,
          ref: "User"
        },
        idCool: String,
        date: {
          type: Date,
          "default": Date.now
        },
        userName: String
      }
    ],
    followers: [
      {
        idUser: {
          type: mongoose.Schema.Types.ObjectId,
          index: true,
          ref: "User"
        },
        idCool: String,
        date: {
          type: Date,
          "default": Date.now
        },
        userName: String
      }
    ],
    tribunal: [
      {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        ref: "Ongoing"
      }
    ],
    tribunalHistoric: [
      {
        idCase: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ongoing"
        },
        answer: {
          type: Boolean,
          "default": false
        },
        voteDate: Date
      }
    ],
    challengeCompleted: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Challenge"
      }
    ],
    challengeRate: [
      {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        ref: "Challenge"
      }
    ],
    challengeRateHistoric: [
      {
        _idChallenge: {
          type: mongoose.Schema.Types.ObjectId,
          index: true,
          ref: "Challenge"
        },
        rateDate: Date,
        rating: {
          difficulty: Number,
          quickness: Number,
          fun: Number
        }
      }
    ]
  });

  userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  };

  userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
  };

  userSchema.index({
    userRand: "2d"
  });

  module.exports = mongoose.model("User", userSchema);

}).call(this);
