from gaia_get_star_info import fetch_and_print_star_data


# 1. Resolve Taurus (Tau) star names to precise ICRS positions via SIMBAD
names = [
    "Alpha Tau",
    "Beta Tau",
    "Gamma Tau",
    "Delta1 Tau",
    "Delta2 Tau",
    "Delta3 Tau",
    "Epsilon Tau",
    "Zeta Tau",
    "Eta Tau",
    "Theta1 Tau",
    "Theta2 Tau",
    "Iota Tau",
    "Kappa1 Tau",
    "Kappa2 Tau",
    "Lambda Tau",
    "Mu Tau",
    "Nu Tau",
    "Xi Tau",
    "Omicron Tau",
    "Pi Tau",
    "Rho Tau",
    "Sigma1 Tau",
    "Sigma2 Tau",
    "Tau Tau",
    "Upsilon Tau",
    "Phi Tau",
    "Chi Tau",
    "Psi Tau",
    "Omega1 Tau",
    "Omega2 Tau",
    "16 Tau", # Celaeno
    "17 Tau", # Electra
    "19 Tau", # Taygeta
    "20 Tau", # Maia
    "21 Tau", # Asterope
    "22 Tau", # Asterope II
    "23 Tau", # Merope
    "27 Tau", # Atlas
    "28 Tau", # Pleione
    "10 Tau",
    "37 Tau",
    "88 Tau",
    "90 Tau",
]

fetch_and_print_star_data(names)
