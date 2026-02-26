from gaia_get_star_info import fetch_and_print_star_data


# 1. Resolve Virgo star names to precise ICRS positions via SIMBAD
names = [
    # Major Named Stars
    "Spica",          # Alpha Virginis
    "Zavijava",       # Beta Virginis
    "Porrima",        # Gamma Virginis
    "Auva",           # Delta Virginis
    "Vindemiatrix",   # Epsilon Virginis
    "Heze",           # Zeta Virginis
    "Zaniah",         # Eta Virginis
    "Syrma",          # Iota Virginis
    "Rijl al Awwa",   # Mu Virginis
    "Khambalia",      # Lambda Virginis
    "109 Virginis",
    "70 Virginis",
    
    # Other Bayer / Flamsteed stars
    "Kappa Virginis",
    "Nu Virginis",
    "Xi Virginis", # Added
    "Omicron Virginis",
    "Pi Virginis",
    "Rho Virginis",
    "Sigma Virginis",
    "Tau Virginis",
    "Upsilon Virginis",
    "Phi Virginis",
    "Chi Virginis",
    "Psi Virginis",
    "Omega Virginis",
    "Theta Virginis",

    # Latin Letter designations
    "b Virginis",
    "c Virginis",
    "d Virginis", # 31 Vir
    "e Virginis", # 59 Vir
    "f Virginis", # 25 Vir
    "g Virginis",
    "h Virginis", # 76 Vir
    "k Virginis", # 44 Vir
    "l Virginis", # 74 Vir
    "m Virginis", # 82 Vir
    "o Virginis", # 78 Vir
    "p Virginis", # 60 Vir
    "q Virginis", # 21 Vir
    "y Virginis", # 86 Vir
    
    # Selected Flamsteed
    "61 Virginis",    # Solar analog
    "38 Virginis",
    "17 Virginis",
    "89 Virginis",
    "92 Virginis",
    "98 Virginis",
    
    # Notable Objects / Variables
    "GW Virginis",    # Prototype of GW Vir variables
    "SS Virginis",    # Mira variable
    "R Virginis",     # Mira variable
    "DT Virginis",    # Ross 458
    "FL Virginis",    # Wolf 424
    "Ross 128",       # Nearby star
]

fetch_and_print_star_data(names)