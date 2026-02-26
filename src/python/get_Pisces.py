from gaia_get_star_info import fetch_and_print_star_data

# 1. Resolve Pisces star names to precise ICRS positions via SIMBAD
names = [
    "Alpha Psc", 
    "Beta Psc", 
    "Gamma Psc", 
    "Delta Psc", 
    "Epsilon Psc", 
    "Zeta Psc", 
    "Eta Psc", 
    "Theta Psc",
    "Iota Psc",
    "Kappa Psc",
    "Lambda Psc",
    "Mu Psc",
    "Nu Psc",
    "Xi Psc",
    "Omicron Psc",
    "Pi Psc",
    "Rho Psc",
    "Sigma Psc",
    "Tau Psc",
    "Upsilon Psc",
    "Phi Psc",
    "Chi Psc",
    "Psi1 Psc",
    "Psi2 Psc",
    "Psi3 Psc",
    "Omega Psc"
]

fetch_and_print_star_data(names)
