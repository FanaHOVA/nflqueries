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
  "WAS": ['Washington Redskins', 'Redskins', 'Skins', 'Washington Professional Football Team'] //Shoutout Bill Simmons
}

var seasonsq = /(more|less) than (\d{1,2}) (seasons|years)/i

var teamq = /from\s(\w+)\b\s?(State|St|Carolina|Florida|Washington|Arizona|Colorado|Utah|Southern|Madison|College|Hampshire|Island|Brook|Tech|A&M|View A&M|Illinois|Diego State|Kentucky|Carolina Central|Carolina State|Dakota State|San Antonio|Michigan|Missouri State|Lafayette|Mexico State|Valley State)?/i

var jerseyq = /number (\d{1,2})\b/i

var weightq = /weighs? (more|less) than (\d{1,3})/i
var weight2q = /(under|over) (\d{1,3})/i

var startswithq = /(first|last) names? starts? with\sa?n?\s?(\w+)\b/i

var activeq = /active/i
var injuredq = /injured/i

var nflteamq = /(Cardinals|Falcons|Ravens|Bills|Panthers|Bears|Bengals|Browns|Cowboys|Broncos|Lions|Packers|Texans|Colts|Jaguars|Chiefs|Dolphins|Vikings|Patriots|Saints|Giants|Jets|Raiders|Eagles|Steelers|Chargers|Seahawks|49ers|Rams|Buccaneers|Titans|Redskins)/

var names = [];


var count = 0;

function getvalues() {

  var query = $('#query').value;

  $('#noresults').empty();
  $('#nofresults').empty();
  $('#result').empty();

  seasons = seasonsq.exec(query);
  team = teamq.exec(query);
  jersey = jerseyq.exec(query);
  weight = weightq.exec(query);
  weight2 = weight2q.exec(query);
  startswith = startswithq.exec(query);
  active = activeq.exec(query);
  injured = injuredq.exec(query);
  nflteam = nflteamq.exec(query);

  if (seasons || team || jersey || weight || startswith || active || injured || nflteam) {
    $.getJSON("../../data/players.json", function(json) {
      $.each(json, function(i, v) {



        if (jersey && String(jersey[1])) {
          if (String(v.number) != jersey[1]) {
            return;
          }
        }

        if (weight || weight2) {
          pweight = parseInt(v.weight);
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
            if (String(v.first_name).slice(0, max).toUpperCase() != qstart.toUpperCase()) {
              return;
            }
          } else if (String(v.last_name).slice(0, max).toUpperCase() != qstart.toUpperCase()) {
            return;
          }
        }

        if (team && v.college) {

          if (team[2] != undefined) {
            if (team[2] == 'St') {
              collegeteam = [team[1], 'State'].join(" ")
            } else {
              collegeteam = [team[1], team[2]].join(" ")
            }
          } else {
            collegeteam = team[1]
          }
          if ((String(v.college).toLowerCase() != String(collegeteam).toLowerCase())) {
            return;
          }
        }

        if (seasons && v.years_pro) {
          pseasons = parseInt(v.years_pro);
          if (seasons[1] == 'more') {
            if (pseasons > parseInt(seasons[2])) {
              return;

            }
          } else if (pseasons < seasons[2]) {
            return;
          }
        }

        if (active) {
          if (v.status != 'ACT') {
            return;
          }
        }

        if (injured) {
          if (v.status != 'RES') {
            return;
          }
        }

        if (nflteam) {
          if (v.team === undefined) {
            return;
          } else if (teamsaliases[v.team].indexOf(nflteam[1]) < 1) {
            return;
          }
        }



        names.push(String(v.full_name));


      });

      if (names.length < 1) {
        $('#noresults').innerHTML = "No results <br> <img src='http://s3.amazonaws.com/br-cdn/temp_images/2013/10/07/TommyKellySad.gif'>";
      } else {
        var nOfMatches = document.createElement('div');
        nOfMatches.innerHTML = names.length + ' results found!<br>';
        $('#nofresults').appendChild(nOfMatches);
        names.sort();
        for (i = 0; i < names.length; i++) {
          var playerPanel = document.createElement('div');
          playerPanel.className = 'panel panel-default';
          var panelBody = document.createElement('div');
          panelBody.className = 'panel-body';
          playerPanel.appendChild(panelBody);
          panelBody.innerHTML = names[i];
          $('#result').appendChild(playerPanel);
        }
        names = [];
        seasonsq.lastIndex = 0;
        jerseyq.lastIndex = 0;
        teamq.lastIndex = 0;
        startswithq.lastIndex = 0;
        weightq.lastIndex = 0;
        weight2q.lastIndex = 0;
      }


    });
  } else {
    $('#noresults').innerHTML = "Invalid/empty query!";

  }

};
