require 'open-uri'

players = open('https://raw.githubusercontent.com/BurntSushi/nflgame/master/nflgame/players.json')

IO.copy_stream(players, 'data/players.json')
