from gaia_get_star_info import fetch_and_print_star_data

# 1. Resolve (Ursa Minor) star names to precise ICRS positions via SIMBAD
names = [
    "Polaris",
    "Kochab",
    "Pherkad",
    "Yildun",
    "Epsilon Ursae Minoris",
    "Zeta Ursae Minoris",
    "Eta Ursae Minoris"
]

fetch_and_print_star_data(names)