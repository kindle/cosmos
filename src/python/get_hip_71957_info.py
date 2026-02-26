from astroquery.simbad import Simbad

# Add identifiers to the output
Simbad.add_votable_fields('ids')

# Query by HIP number
result_table = Simbad.query_object("HIP 71957")

if result_table is not None:
    print(result_table['IDS'][0])
else:
    print("Star not found in Simbad.")
