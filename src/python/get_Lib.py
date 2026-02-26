from gaia_get_star_info import fetch_and_print_star_data


# 1. Resolve Libra star names to precise ICRS positions via SIMBAD
names = [
    # Major Stars - Proper Names
    "Zubenelgenubi",   # Alpha Librae
    "Zubeneschamali",  # Beta Librae
    "Zubenelakrab",    # Gamma Librae
    "Zubenelhakrabi",  # Nu Librae ? No, Gamma is Zubenelakrab. Nu is Zubenelhakrabi (sometimes). Check Simbad preferred.
    "Brachium",        # Sigma Librae
    "Zuben Elakribi",  # Delta Librae
    
    # Bayer / Flamsteed
    "Alpha Librae",
    "Beta Librae",
    "Gamma Librae",
    "Delta Librae",
    "Epsilon Librae",
    "Zeta Librae",     # Part of the "claw" visual
    "Eta Librae",
    "Theta Librae",
    "Iota1 Librae",
    "Kappa Librae",
    "Lambda Librae",
    "Mu Librae",
    "Nu Librae",
    "Xi2 Librae",
    "Omicron Librae",
    "Sigma Librae",
    "Tau Librae",
    "Upsilon Librae",
    
    # Notable / Variable
    "48 Librae",       # Shell star
    "Gliese 581",      # Exoplanet host, HO Librae
    "HD 140283"        # Methuselah star
]

fetch_and_print_star_data(names)