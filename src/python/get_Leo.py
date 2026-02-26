from gaia_get_star_info import fetch_and_print_star_data


# 1. Resolve Lion star names to precise ICRS positions via SIMBAD
names = [
    # Major Stars
    "Regulus",       # Alpha Leonis
    "Denebola",      # Beta Leonis
    "Algieba",       # Gamma Leonis
    "Zosma",         # Delta Leonis
    "Rasalas",       # Mu Leonis
    "Adhafera",      # Zeta Leonis
    "Chertan",       # Theta Leonis
    "Eta Leo",       # Al Jabhah (HIP 49583)
    "Subra",         # Omicron Leonis
    "Rho Leonis",    # Rho Leonis
    "Iota Leonis",   # Iota Leonis
    "Sigma Leonis",  # Sigma Leonis
    
    # Other Bayer / Flamsteed stars
    "Epsilon Leonis", # Algenubi
    "Kappa Leonis",   # Al Minliar al Asad
    "Lambda Leonis",  # Alterf
    "Nu Leonis",
    "Xi Leonis",
    "Pi Leonis",
    "Tau Leonis",
    "Upsilon Leonis",
    "Phi Leonis",
    "Chi Leonis",
    "Psi Leonis",
    "Omega Leonis",
    
    # Selected Flamsteed numbers
    "18 Leonis",
    "31 Leonis",
    "40 Leonis",
    "44 Leonis",
    "46 Leonis",
    "51 Leonis",
    "52 Leonis",
    "54 Leonis",
    "59 Leonis",
    "60 Leonis",
    "72 Leonis",
    "79 Leonis",
    "85 Leonis",
    "89 Leonis",
    "92 Leonis",
    "93 Leonis",
    
    # Variable / Other stars of interest
    "R Leonis",       # Mira variable
    "Wolf 359",       # Nearby red dwarf
    "Gliese 436",     # Exoplanet host
    "CW Leonis"       # IRC +10216
]

fetch_and_print_star_data(names)
