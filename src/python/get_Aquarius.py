from gaia_get_star_info import fetch_and_print_star_data

# 1. Resolve Aquarius (Water Carrier) star names to precise ICRS positions via SIMBAD
names = [
    "Alpha Aqr", 
    "Beta Aqr", 
    "Gamma Aqr", 
    "Delta Aqr", 
    "Epsilon Aqr", 
    "Zeta Aqr", 
    "Eta Aqr", 
    "Theta Aqr", 
    "Iota Aqr",
    "Kappa Aqr",
    "Lambda Aqr", 
    "Mu Aqr",
    "Nu Aqr",
    "Xi Aqr",
    "Omicron Aqr",
    "Pi Aqr",
    "Rho Aqr",
    "Sigma Aqr",
    "Tau1 Aqr",
    "Tau2 Aqr",
    "Upsilon Aqr",
    "Phi Aqr",
    "Chi Aqr",
    "Psi1 Aqr",
    "Psi2 Aqr",
    "Psi3 Aqr",
    "Omega1 Aqr",
    "Omega2 Aqr"
]

fetch_and_print_star_data(names)


