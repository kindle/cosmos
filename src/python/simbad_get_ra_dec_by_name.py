from astroquery.simbad import Simbad

names = ["Dubhe", "Merak", "Phecda", "Megrez", "Alioth", "Mizar", "Alkaid"]
Simbad.add_votable_fields('ra(d)', 'dec(d)')  # RA/Dec in degrees

result = Simbad.query_objects(names)

for name, ra_deg, dec_deg in zip(result['MAIN_ID'], result['RA_d'], result['DEC_d']):
    print(name, float(ra_deg), float(dec_deg))