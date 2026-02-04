import http.client
import json

conn = http.client.HTTPSConnection("soccer-football-info.p.rapidapi.com")

headers = {
    'x-rapidapi-key': "6a621c1e3emshf85fa7326e2c189p113198jsnfb0b0852c6e4",
    'x-rapidapi-host': "soccer-football-info.p.rapidapi.com"
}

results = []
for code in ["EU", "INT"]:
    try:
        conn.request("GET", f"/championships/list/?c={code}", headers=headers)
        res = conn.getresponse()
        data = json.loads(res.read().decode("utf-8"))
        results.extend(data.get("result", []))
    except Exception as e:
        print(f"Error for {code}: {e}")

with open("international_leagues.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=4)

print("Scan complete.")
