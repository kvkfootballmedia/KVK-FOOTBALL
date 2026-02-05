import http.client
import json

conn = http.client.HTTPSConnection("soccer-football-info.p.rapidapi.com")

headers = {
    'x-rapidapi-key': "6a621c1e3emshf85fa7326e2c189p113198jsnfb0b0852c6e4",
    'x-rapidapi-host': "soccer-football-info.p.rapidapi.com"
}

leagues = {}
for code in ["FR", "GB", "ES", "IT", "DE"]:
    try:
        conn.request("GET", f"/championships/list/?c={code}", headers=headers)
        res = conn.getresponse()
        data = json.loads(res.read().decode("utf-8"))
        leagues[code] = data.get("result", [])
    except Exception as e:
        print(f"Error fetching {code}: {e}")

with open("major_leagues_fixed.json", "w", encoding="utf-8") as f:
    json.dump(leagues, f, indent=4)

print("Fetch complete.")
