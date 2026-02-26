from astroquery.simbad import Simbad

# Query for identifiers
ident_table = Simbad.query_objectids("HIP 49583")

if ident_table:
    names = ident_table['ID']
    print("Identifiers for HIP 49583:")
    for name in names:
        print(name)
else:
    print("No identifiers found for HIP 49583")

# Query for constellation and coordinates
Simbad.add_votable_fields('ra(d)', 'dec(d)', 'constellation')
result = Simbad.query_object("HIP 49583")

if result:
    print("\nMain Table Info:")
    print(result)
else:
    print("No main info found for HIP 49583")
