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
    """Query Gaia DR3 around (ra, dec) and return best-match G magnitude.

    We use a small cone search and pick the closest source in angular distance.
    """

    coord = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg, frame="icrs")
    radius = radius_arcsec * u.arcsec

    # Use DR3 by default
    Gaia.MAIN_GAIA_TABLE = "gaiadr3.gaia_source"
    # In current astroquery, radius must be passed as a keyword arg
    job = Gaia.cone_search_async(coord, radius=radius)
    tbl = job.get_results()

    if len(tbl) == 0:
        return None

    # tbl["ra"] and tbl["dec"] are already Quantities with angle units; don't multiply by u.deg
    gaia_coords = SkyCoord(ra=tbl["ra"], dec=tbl["dec"], frame="icrs")
    sep = coord.separation(gaia_coords)
    idx = sep.argmin()

    g = tbl["phot_g_mean_mag"][idx]
    if g is None or g != g:  # None or NaN
        return None
    return float(g)

def fetch_and_print_star_data(names):
    Simbad.add_votable_fields("ra(d)", "dec(d)", "flux(V)")
    result = Simbad.query_objects(names)

    if result is None:
        print("No results found.")
        return

    for row in result:
        name = row["MAIN_ID"].decode() if hasattr(row["MAIN_ID"], "decode") else row["MAIN_ID"]
        ra_deg = float(row["RA_d"])
        dec_deg = float(row["DEC_d"])

        # Try to get V-band magnitude directly from Simbad first (more reliable for bright stars)
        # The column name for flux(V) is usually 'FLUX_V'
        gmag = None
        if 'FLUX_V' in result.colnames:
             val = row['FLUX_V']
             # Check if it's masked or nan
             if val is not None and str(val) != '--' and not (isinstance(val, float) and math.isnan(val)):
                 gmag = float(val)

        # If Simbad V-mag is missing, fall back to Gaia G-mag
        if gmag is None:
            gmag = get_gaia_gmag(ra_deg, dec_deg, 21)
        
        # Calculate x, y, z coordinates
        x, y, z = ra_dec_to_xyz(ra_deg, dec_deg, radius=1.0) # radius=1 for unit sphere
        
        # Output: name, ra, dec, x, y, z, gmag
        # Standardize b value: ~ 22 - mag if missing, but we prefer using g directly now.
        name_clean = name.replace('* ', '').strip()
        print(f"{{db:'{name}',en:'{name_clean}', zh:'{name_clean}', ra:{ra_deg}, dec:{dec_deg}, x:{x}, y:{y}, z:{z}, g:{gmag}}},")
