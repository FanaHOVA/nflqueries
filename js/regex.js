var seasonsq = /(more|less) than (\d{1,2})/g
var teamq = /from (.+)\b/g
var jerseyq = /number (.+)\b/g
var weightq = /weighs? (more|less) than (\d{1,3})/g
var startswithq = /(first|last) names? starts? with (.)/g

var year = new Date().getFullYear();
var names = [];

function getvalues() {
    
    var query = document.getElementById("query").value;        
    
        seasons = /(more|less) than (\d{1,2})/g.exec(query);
        team = /from (.+)\b/g.exec(query);
        jersey = /number (.+)\b/g.exec(query);
        weight = /weighs? (more|less) than (\d{1,2})/g.exec(query);
        startswith = /(first|last) names? starts? with (.)/g.exec(query);
    
    $.getJSON("players.json", function(json) {
        $.each(json, function(i, v) {
            
            if (jersey != null && String(jersey[1])) {
                if (String(v.number) != jersey[1]) {
                    return;
                } 
            }
            
            if (weight != null && String(weight[1]) == 'more') {
                pweight = parseInt(v.weight);
                qweight = parseInt(weight[2]);
            
                if (pweight > qweight) {
                    return;
                  } else if (pweight < qweight) {
                        return;
                    }
            }
             
            
            if (startswith != null && String(startswith[1]) == 'first') {
                qstart = startswith[2];
               if (String(v.first_name).slice(0) != qstart) {
                    return;
                }
            } else if (String(v.last_name).slice(0) != qstart) {
                    return;
                }
            
        
        if (team != null && !(String(v.college).contains(String(team[1])))) {
            return;
        }
        
        if (seasons != null && String(seasons[1]) == 'more') {
            pseasons = parseInt(v.years_pro);
            if (pseasons > seasons[2]) {
                return;
            }
        } else if (pseasons < seasons[2]) {
            return;
        }
            
        names.push(String(v.full_name));
                
        });
         
        
        });
        
        if (names.length < 1) {
            document.getElementById('result').innerHTML("No results :(");
        } else {
        for(i=0; i < names.length; i++) {
            var newPlayer = document.createElement('div');
            newPlayer.innerHTML = names[i];
            document.getElementById('result').appendChild(newPlayer);
        }
        }
    
};

    
               
