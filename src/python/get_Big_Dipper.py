from gaia_get_star_info import fetch_and_print_star_data

# 1. Resolve Big Dipper (Ursa Major) star names to precise ICRS positions via SIMBAD
names = [
    "Alkaid",
    "Dubhe",
    "Merak",
    "Phecda",
    "Megrez",
    "Alioth",
    "Mizar"
]

fetch_and_print_star_data(names)