import http.client
import json
import time

conn = http.client.HTTPSConnection("soccer-football-info.p.rapidapi.com")

headers = {
    'x-rapidapi-key': "6a621c1e3emshf85fa7326e2c189p113198jsnfb0b0852c6e4",
    'x-rapidapi-host': "soccer-football-info.p.rapidapi.com"
}

important_leagues = []

for p in range(1, 150):
    try:
        conn.request("GET", f"/championships/list/?p={p}", headers=headers)
        res = conn.getresponse()
        data = json.loads(res.read().decode("utf-8"))
        results = data.get("result", [])
        if not results: break
        
        for item in results:
            if item.get("important") == True:
                important_leagues.append(item)
                    
        time.sleep(0.05)
    except Exception as e:
        print(f"Error on page {p}: {e}")
        break

with open("important_leagues.json", "w", encoding="utf-8") as f:
    json.dump(important_leagues, f, indent=4)

print("Important leagues scan complete.")
