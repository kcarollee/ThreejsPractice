n = op('freq')
# populate the table first
# there are 25 keys on the Launchkey Mini
# the first two rows should be left to zero
num_notes = 25

while n.numRows < 27:
	n.appendRow()

# note starts at C
# Freq = starting note freq * pow(2, N / 12), where N is the number
# of notes away from the starting note
starting_freq = 261.64 
n_away = 0
for index in range(2, 27):
	exponent = n_away / 12
	freq = starting_freq * (2 ** exponent)
	n[index, 0] = freq
	n_away += 1

