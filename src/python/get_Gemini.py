from gaia_get_star_info import fetch_and_print_star_data


# 1. Resolve Gemini (Twins) star names to precise ICRS positions via SIMBAD
names = [
    "Alpha Gem", 
    "Beta Gem", 
    "Gamma Gem", 
    "Delta Gem", 
    "Epsilon Gem", 
    "Zeta Gem", 
    "Eta Gem", 
    "Theta Gem",
    "Iota Gem",
    "Kappa Gem",
    "Lambda Gem",
    "13 Gem", 
    "18 Gem",
    "Xi Gem",
    "Omicron Gem",
    "Pi Gem",
    "Rho Gem",
    "Sigma Gem",
    "Tau Gem",
    "Upsilon Gem",
    "Phi Gem",
    "Chi Gem",
    "Omega Gem",
    "1 Gem", 
    "36 Gem"
]

fetch_and_print_star_data(names)
