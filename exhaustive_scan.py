import http.client
import json
import time

conn = http.client.HTTPSConnection("soccer-football-info.p.rapidapi.com")

headers = {
    'x-rapidapi-key': "6a621c1e3emshf85fa7326e2c189p113198jsnfb0b0852c6e4",
    'x-rapidapi-host': "soccer-football-info.p.rapidapi.com"
}

targets = [
    "France Ligue 1",
    "England Premier League",
    "Spain Primera Liga",
    "Italy Serie A",
    "Germany Bundesliga",
    "UEFA Champions League",
    "UEFA Europa League",
    "World Cup"
]

all_found = {}

# Scan all pages (approx 115)
for p in range(1, 120):
    try:
        conn.request("GET", f"/championships/list/?p={p}", headers=headers)
        res = conn.getresponse()
        data = json.loads(res.read().decode("utf-8"))
        results = data.get("result", [])
        if not results: break
        
        for item in results:
            name = item["name"]
            for t in targets:
                if t.lower() in name.lower():
                    if t not in all_found: all_found[t] = []
                    all_found[t].append(item)
                    
        print(f"Scanned page {p}...")
        time.sleep(0.1) # Avoid hitting rate limits too hard
    except Exception as e:
        print(f"Error on page {p}: {e}")
        break

with open("final_leagues.json", "w", encoding="utf-8") as f:
    json.dump(all_found, f, indent=4)

print("Scan complete.")
