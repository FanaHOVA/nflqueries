var teamsaliases = {
  "ARI": ['Arizona Cardinals', 'Cardinals'],
  "ATL": ['Atlanta Falcons', 'Falcons'],
  "BAL": ['Baltimore Ravens', 'Ravens'],
  "BUF": ['Buffalo Bills', 'Bills'],
  "CAR": ['Carolina Panthers', 'Panthers'],
  "CHI": ['Chicago Bears', 'Bears'],
  "CIN": ['Cincinnati Bengals', 'Bengals', 'Cincy'],
  "CLE": ['Cleveland Browns', 'Browns'],
  "DAL": ['Dallas Cowboys', 'Cowboys'],
  "DEN": ['Denver Broncos', 'Broncos'],
  "DET": ['Detroit Lions', 'Lions'],
  "GB": ['Green Bay Packers', 'Green Bay', 'Packers', 'Packs'],
  "HOU": ['Houston Texans', 'Texans'],
  "IND": ['Indianapolis Colts', 'Indy', 'Colts'],
  "JAC": ['Jacksonville Jaguars', 'Jaguars', 'Jags'],
  "KC": ['Kansas City Chiefs', 'Chiefs'],
  "MIA": ['Miami Dolphins', 'Dolphins'],
  "MIN": ['Minnesota Vikings', 'Minny', 'Vikings'],
  "NE": ['New England Patriots', 'New England', 'Patriots', 'Pats'],
  "NO": ['New Orleans Saints', 'Saints'],
  "NYG": ['New York Giants', 'Giants'],
  "NYJ": ['New York Jets', 'Jets'],
  "OAK": ['Oakland Raiders', 'Raiders'],
  "PHI": ['Philadelphia Eagles', 'Philly', 'Eagles'],
  "PIT": ['Pittsburgh Steelers', 'Pitts', 'Steelers'],
  "SD": ['San Diego Chargers', 'Chargers'],
  "SEA": ['Seattle Seahawks', 'Seahawks'],
  "SF": ['San Francisco 49ers', '49ers'],
  "STL": ['St. Louis Rams', 'St Louis Rams', 'Rams'],
  "TB": ['Tampa Bay Buccaneers', 'Buccaneers', 'Bucs'],
  "TEN": ['Tennessee Titans', 'Titans'],
  "WAS": ['Washington Redskins', 'Redskins', 'Washington Professional Football Team', 'DC Grudens'] //S/o Bill Simmons and Joe House
}

var regexAliases = []

var seasonsq = /(more|less) than (\d{1,2}) (seasons|years)/i

var teamq = /from\s(\w+)\b\s?(State|St|Carolina|Florida|Washington|Arizona|Colorado|Utah|Southern|Madison|College|Hampshire|Island|Brook|Tech|A&M|View A&M|Illinois|Diego State|Kentucky|Carolina Central|Carolina State|Dakota State|San Antonio|Michigan|Missouri State|Lafayette|Mexico State|Valley State)?/i

var jerseyq = /number (\d{1,2})\b/i

var weightq = /weighs? (more|less) than (\d{1,3})/i
var weight2q = /(under|over) (\d{1,3})/i

var startswithq = /(first|last) names? starts? with\sa?n?\s?(\w+)\b/i

var activeq = /active/i
var injuredq = /injured/i

Object.keys(teamsaliases).forEach(function (key) {
    var array = teamsaliases[key];
    $.merge(regexAliases, array);
})

var nflteamq = new RegExp(regexAliases.join('|'), "i");

var players = [];


var count = 0;

function getvalues() {

  var query = document.getElementById("query").value;

  document.getElementById('noresults').innerHTML = "";
  document.getElementById('nofresults').innerHTML = "";
  document.getElementById('result').innerHTML = "";

  seasons = seasonsq.exec(query);
  team = teamq.exec(query);
  jersey = jerseyq.exec(query);
  weight = weightq.exec(query);
  weight2 = weight2q.exec(query);
  startswith = startswithq.exec(query);
  active = activeq.exec(query);
  injured = injuredq.exec(query);
  nflteam = nflteamq.exec(query);
  console.log(nflteamq.exec(query));

  if (seasons || team || jersey || weight || startswith || active || injured || nflteam) {
    $.getJSON("../../data/players.json", function(json) {
      $.each(json, function(i, player) {


        if (player.status != 'ACT') {
          return;
        }

        if (jersey && String(jersey[1])) {
          if (String(player.number) != jersey[1]) {
            return;
          }
        }

        if (weight || weight2) {
          pweight = parseInt(player.weight);
          if (weight) {
            qweight = parseInt(weight[2]);
            moreless = String(weight[1]);
          } else {
            qweight = parseInt(weight2[2]);
            moreless = String(weight2[1]);
          }

          if (moreless == 'more' || moreless == 'over') {
            if (pweight < qweight) {
              return;

            }
          } else {

            if (pweight > qweight) {
              return;

            }
          }
        }



        if (startswith) {
          qstart = startswith[2];
          if (String(startswith[1]) == 'first') {
            qstart = startswith[2];
            max = String(startswith[2]).length;
            if (String(player.first_name).slice(0, max).toUpperCase() != qstart.toUpperCase()) {
              return;
            }
          } else if (String(player.last_name).slice(0, max).toUpperCase() != qstart.toUpperCase()) {
            return;
          }
        }

        if (team && player.college) {

          if (team[2] != undefined) {
            if (team[2] == 'St') {
              collegeteam = [team[1], 'State'].join(" ")
            } else {
              collegeteam = [team[1], team[2]].join(" ")
            }
          } else {
            collegeteam = team[1]
          }
          if ((String(player.college).toLowerCase() != String(collegeteam).toLowerCase())) {
            return;
          }
        }

        if (seasons && player.years_pro) {
          pseasons = parseInt(player.years_pro);
          if (seasons[1] == 'more') {
            if (pseasons > parseInt(seasons[2])) {
              return;

            }
          } else if (pseasons < seasons[2]) {
            return;
          }
        }

        if (injured) {
          if (player.status != 'RES') {
            return;
          }
        }

        if (nflteam) {
          if (player.team === undefined) {
            return;
          } else if (teamsaliases[player.team].indexOf(nflteam[0]) < 1) {
            return;
          }
        }
        players.push(player);
      });

      if (players.length < 1) {
        document.getElementById('noresults').innerHTML = "No results <br> <img src='http://s3.amazonaws.com/br-cdn/temp_images/2013/10/07/TommyKellySad.gif'>";
      } else {
        $('.queries').empty();
        var nOfMatches = document.createElement('div');
        nOfMatches.innerHTML = players.length + ' results found!<br>';
        document.getElementById('nofresults').appendChild(nOfMatches);
        players.sort();
        for (i = 0; i < players.length; i++) {
          playerCard = '<div class="col-md-4">\
                        <blockquote class="player-card ' + players[i].team + '">\
                          <p class="player-card-name">\
                            ' + players[i].full_name + '\
                          </p>\
                          <p class="player-card-infos">' + teamsaliases[players[i].team][0] + ' #' + players[i].number + '</p>\
                          <hr>\
                          <div class="player-card-footer">\
                            <p class="pull-left">\
                              From ' + players[i].college + '\
                            </p>\
                            <p class="pull-right">\
                              ' + players[i].weight + 'lbs\
                            </p>\
                          </div>\
                        </blockquote>\
                        </div>'

          $('#result').append(playerCard);
        }
        players = [];
        seasonsq.lastIndex = 0;
        jerseyq.lastIndex = 0;
        teamq.lastIndex = 0;
        startswithq.lastIndex = 0;
        weightq.lastIndex = 0;
        weight2q.lastIndex = 0;
      }


    });
  } else {
    document.getElementById('noresults').innerHTML = "Invalid/empty query!";

  }

};
