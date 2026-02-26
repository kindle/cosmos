from gaia_get_star_info import fetch_and_print_star_data


# 1. Resolve Cancer star names to precise ICRS positions via SIMBAD
names = [
    "Alpha Cnc",
    "Beta Cnc",
    "Gamma Cnc",
    "Delta Cnc",
    "Epsilon Cnc",
    "Zeta Cnc",
    "Eta Cnc",
    "Theta Cnc",
    "Iota Cnc",
    "Kappa Cnc",
    "Lambda Cnc",
    "Mu Cnc",
    "Nu Cnc",
    "Xi Cnc",
    "Omicron1 Cnc",
    "Omicron2 Cnc",
    "Pi Cnc",
    "Rho1 Cnc",
    "Rho2 Cnc",
    "Sigma1 Cnc",
    "Sigma2 Cnc",
    "Tau Cnc",
    "Upsilon1 Cnc",
    "Upsilon2 Cnc",
    "Phi1 Cnc",
    "Phi2 Cnc",
    "Chi Cnc",
    "Psi Cnc",
    "Omega1 Cnc",
    "Omega2 Cnc",
    "55 Cnc",
]

fetch_and_print_star_data(names)
