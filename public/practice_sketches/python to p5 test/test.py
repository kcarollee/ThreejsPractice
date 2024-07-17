import json
import random

val_array = [0]
time = 0
while True:
    if time % 10000000 == 0:
        val_array.append(random.randrange(2000, 4000))
        test_json = {
            "values": val_array
        }

        with open("test.json", "w") as outfile:
            json.dump(test_json, outfile)
    time += 1

