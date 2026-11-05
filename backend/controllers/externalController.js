// Third-party API: Nager.Date public holidays (free, no API key).
// Proxied through our backend so the browser never calls it directly:
// no CORS issues, results are cached, and we can swap providers (or add a key) later.
const BASE_URL = "https://date.nager.at/api/v3";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map();

const getHolidays = async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const country = String(req.query.country || "IN").toUpperCase();

  if (!/^[A-Z]{2}$/.test(country) || year < 1990 || year > 2100) {
    return res.status(400).json({ message: "Invalid year or country code" });
  }

  const key = `${country}-${year}`;
  const hit = cache.get(key);

  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return res.status(200).json({ country, year, cached: true, holidays: hit.data });
  }

  try {
    const response = await fetch(`${BASE_URL}/PublicHolidays/${year}/${country}`, {
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return res.status(502).json({ message: "Holiday service returned an error" });
    }

    const raw = await response.json();
    const holidays = raw.map((h) => ({
      date: h.date,
      name: h.name,
      localName: h.localName
    }));

    cache.set(key, { at: Date.now(), data: holidays });

    res.status(200).json({ country, year, cached: false, holidays });
  } catch (error) {
    // Serve stale data if the provider is down
    if (hit) {
      return res.status(200).json({ country, year, cached: true, stale: true, holidays: hit.data });
    }
    res.status(502).json({ message: "Holiday service unavailable" });
  }
};

module.exports = { getHolidays };
