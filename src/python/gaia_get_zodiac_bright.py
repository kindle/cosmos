from astroquery.simbad import Simbad
from astroquery.gaia import Gaia
from astropy.coordinates import SkyCoord
from astropy import units as u
import math 


def ra_dec_to_xyz(ra_deg, dec_deg, radius=1.0):
    k = math.pi / 180.0
    ra = ra_deg * k
    dec = dec_deg * k

    x = radius * math.cos(dec) * math.cos(ra)
    y = radius * math.cos(dec) * math.sin(ra)
    z = radius * math.sin(dec)

    return x, y, z


def get_gaia_gmag(ra_deg: float, dec_deg: float, radius_arcsec: float = 10.0):
    """Query Gaia DR3 around (ra, dec) and return best-match G magnitude."""
    coord = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg, frame="icrs")
    radius = radius_arcsec * u.arcsec
    
    Gaia.MAIN_GAIA_TABLE = "gaiadr3.gaia_source"
    job = Gaia.cone_search_async(coord, radius=radius)
    tbl = job.get_results()

    if len(tbl) == 0:
        return None

    gaia_coords = SkyCoord(ra=tbl["ra"], dec=tbl["dec"], frame="icrs")
    sep = coord.separation(gaia_coords)
    idx = sep.argmin()

    g = tbl["phot_g_mean_mag"][idx]
    if g is None or g != g:
        return None
    return float(g)

# Dictionary of 12 Zodiac Constellations
zodiac_stars = {
    "Aries (白羊座)": [
        "Alpha Ari", "Beta Ari", "Gamma Ari", "Delta Ari", "41 Ari"
    ],
    "Taurus (金牛座)": [
        "Alpha Tau", "Beta Tau", "Eta Tau", "Zeta Tau", "Epsilon Tau", "Lambda Tau", "Theta Tau"
    ],
    "Gemini (双子座)": [
        "Alpha Gem", "Beta Gem", "Gamma Gem", "Delta Gem", "Epsilon Gem", "Zeta Gem", "Eta Gem", "Mu Gem"
    ],
    "Cancer (巨蟹座)": [
        "Alpha Cnc", "Beta Cnc", "Delta Cnc", "Gamma Cnc", "Iota Cnc"
    ],
    "Leo (狮子座)": [
        "Alpha Leo", "Beta Leo", "Gamma Leo", "Delta Leo", "Epsilon Leo", "Zeta Leo", "Theta Leo", "Eta Leo", "Omicron Leo"
    ],
    "Virgo (处女座)": [
        "Alpha Vir", "Beta Vir", "Gamma Vir", "Delta Vir", "Epsilon Vir", "Zeta Vir", "Eta Vir", "Theta Vir"
    ],
    "Libra (天秤座)": [
        "Alpha Lib", "Beta Lib", "Gamma Lib", "Sigma Lib", "Upsilon Lib", "Tau Lib"
    ],
    "Scorpius (天蝎座)": [
        "Alpha Sco", "Beta Sco", "Delta Sco", "Epsilon Sco", "Theta Sco", "Iota Sco", "Kappa Sco", "Lambda Sco", "Upsilon Sco", "Mu1 Sco"
    ],
    "Sagittarius (射手座)": [
        "Alpha Sgr", "Beta Sgr", "Gamma Sgr", "Delta Sgr", "Epsilon Sgr", "Lambda Sgr", "Zeta Sgr", "Sigma Sgr", "Pi Sgr", "Phi Sgr"
    ],
    "Capricornus (摩羯座)": [
        "Alpha Cap", "Beta Cap", "Gamma Cap", "Delta Cap", "Omega Cap", "Psi Cap"
    ],
    "Aquarius (水瓶座)": [
        "Alpha Aqr", "Beta Aqr", "Gamma Aqr", "Delta Aqr", "Epsilon Aqr", "Zeta Aqr", "Eta Aqr", "Theta Aqr", "Lambda Aqr", "Phi Aqr"
    ],
    "Pisces (双鱼座)": [
        "Alpha Psc", "Beta Psc", "Gamma Psc", "Delta Psc", "Epsilon Psc", "Zeta Psc", "Eta Psc", "Omega Psc", "Omicron Psc"
    ]
}

Simbad.add_votable_fields("ra(d)", "dec(d)")

print("Constellation, Name, RA, Dec, x, y, z, G_mag")

for constellation, stars in zodiac_stars.items():
    # Query Simbad for all stars in this constellation
    result = Simbad.query_objects(stars)
    
    if result is None:
        print(f"Skipping {constellation}: No results found")
        continue

    for row in result:
        name = row["MAIN_ID"].decode() if hasattr(row["MAIN_ID"], "decode") else row["MAIN_ID"]
        ra_deg = float(row["RA_d"])
        dec_deg = float(row["DEC_d"])

        gmag = get_gaia_gmag(ra_deg, dec_deg, 20) # 20 arcsec search radius
        x, y, z = ra_dec_to_xyz(ra_deg, dec_deg)
        
        print(f"{constellation}, {name}, {ra_deg}, {dec_deg}, {x}, {y}, {z}, {gmag}")
