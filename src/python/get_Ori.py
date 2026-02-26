from gaia_get_star_info import fetch_and_print_star_data

# 1. Resolve Orion star names to precise ICRS positions via SIMBAD
names = [
    "Betelgeuse",       # Alpha Orionis
    "Rigel",            # Beta Orionis
    "Bellatrix",        # Gamma Orionis
    "Mintaka",          # Delta Orionis
    "Alnilam",          # Epsilon Orionis
    "Alnitak",          # Zeta Orionis
    "Saiph",            # Kappa Orionis
    "Meissa",           # Lambda Orionis
    "Iota Orionis",     # Hatsya
    "Pi3 Orionis",      # Tabit
    "Pi1 Orionis",
    "Pi2 Orionis",
    "Pi4 Orionis",
    "Pi5 Orionis",
    "Eta Orionis",
    "Sigma Orionis",
    "Tau Orionis",
    "Chi1 Orionis",
    "Chi2 Orionis",
    "Phi1 Orionis",
    "Phi2 Orionis",
    "Upsilon Orionis",  # Thabit
    "Psi1 Orionis",
    "Psi2 Orionis",
    "Theta1 Orionis C", # Trapezium Cluster
    "Theta2 Orionis",
    "29 Orionis",
    "42 Orionis",       # c Orionis
    "Omega Orionis"
]

fetch_and_print_star_data(names)
